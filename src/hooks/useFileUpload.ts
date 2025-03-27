import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadFile = async (file: File) => {
    if (!user) {
      throw new Error('Nicht angemeldet');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Nur PDF, JPG und PNG Dateien sind erlaubt');
    }

    try {
      setUploading(true);
      setError(null);

      // Erstelle einen eindeutigen Dateinamen
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const storageRef = ref(storage, `users/${user.id}/${fileName}`);

      // Datei hochladen
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Dokument in Firestore speichern
      await addDoc(collection(db, 'users', user.id, 'documents'), {
        fileUrl: downloadUrl,
        filename: file.name,
        uploadedAt: serverTimestamp()
      });

      return downloadUrl;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, error };
}; 