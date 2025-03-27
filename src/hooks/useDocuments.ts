import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Document {
  id: string;
  fileUrl: string;
  filename: string;
  uploadedAt: Date;
}

type SortOrder = 'newest' | 'oldest';
type DateFilter = 'all' | '7days' | '30days';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'users', user.id, 'documents'),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
        })) as Document[];
        
        setDocuments(docs);
        setLoading(false);
      },
      (err) => {
        console.error('Fehler beim Laden der Dokumente:', err);
        setError('Dokumente konnten nicht geladen werden');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const deleteDocument = async (docId: string, fileUrl: string) => {
    if (!user) return;

    try {
      // Lösche die Datei aus dem Storage
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);

      // Lösche das Dokument aus Firestore
      await deleteDoc(doc(db, 'users', user.id, 'documents', docId));
    } catch (err: any) {
      console.error('Fehler beim Löschen des Dokuments:', err);
      throw new Error('Dokument konnte nicht gelöscht werden');
    }
  };

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = [...documents];

    // Suche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.filename.toLowerCase().includes(query)
      );
    }

    // Datumsfilter
    const now = new Date();
    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(doc => doc.uploadedAt >= sevenDaysAgo);
    } else if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(doc => doc.uploadedAt >= thirtyDaysAgo);
    }

    // Sortierung
    if (sortOrder === 'oldest') {
      filtered.sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime());
    } else {
      filtered.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    }

    return filtered;
  }, [documents, searchQuery, sortOrder, dateFilter]);

  return {
    documents: filteredAndSortedDocuments,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    dateFilter,
    setDateFilter,
    deleteDocument
  };
}; 