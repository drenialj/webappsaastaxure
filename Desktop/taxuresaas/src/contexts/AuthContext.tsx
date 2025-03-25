'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthState } from '@/types/auth';

interface RegisterData {
  email: string;
  password: string;
  role: 'Mandant' | 'Kanzlei';
  kanzleiCode?: string;
}

interface AuthContextType extends AuthState {
  register: (data: RegisterData) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        setState({
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            role: userData?.role,
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
          },
          loading: false,
        });
      } else {
        setState({ user: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const findKanzleiByCode = async (code: string): Promise<string | null> => {
    try {
      // Suche nach Kanzlei-Benutzer mit übereinstimmender E-Mail oder ID
      const emailQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Kanzlei'),
        where('email', '==', code)
      );
      
      const idQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Kanzlei'),
        where('id', '==', code)
      );

      const [emailResults, idResults] = await Promise.all([
        getDocs(emailQuery),
        getDocs(idQuery)
      ]);

      // Prüfe zuerst E-Mail-Ergebnisse
      if (!emailResults.empty) {
        return emailResults.docs[0].id;
      }

      // Dann prüfe ID-Ergebnisse
      if (!idResults.empty) {
        return idResults.docs[0].id;
      }

      return null;
    } catch (error) {
      console.error('Fehler bei der Kanzlei-Suche:', error);
      return null;
    }
  };

  const register = async ({ email, password, role, kanzleiCode }: RegisterData) => {
    try {
      let kanzleiId: string | null = null;

      // Wenn es sich um einen Mandanten handelt, validiere den Kanzlei-Code
      if (role === 'Mandant') {
        if (!kanzleiCode) {
          throw new Error('Bitte geben Sie einen Kanzlei-Code ein');
        }

        kanzleiId = await findKanzleiByCode(kanzleiCode);
        if (!kanzleiId) {
          throw new Error('Ungültiger Kanzlei-Code');
        }
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        role,
        ...(kanzleiId && { kanzleiId }),
        createdAt: serverTimestamp()
      });
      
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 