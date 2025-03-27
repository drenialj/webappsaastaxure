import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Mandant {
  id: string;
  email: string;
  role: 'mandant';
  kanzleiId: string;
}

export const useMandants = () => {
  const [mandants, setMandants] = useState<Mandant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'Kanzlei') {
      setMandants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Query für alle Mandanten dieser Kanzlei
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'Mandant'),
      where('kanzleiId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mandantData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Mandant[];
        
        setMandants(mandantData);
        setLoading(false);
      },
      (err) => {
        console.error('Fehler beim Laden der Mandanten:', err);
        setError('Mandanten konnten nicht geladen werden');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { mandants, loading, error };
}; 