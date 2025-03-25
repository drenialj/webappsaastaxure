export interface User {
  id: string;
  email: string;
  role?: 'Mandant' | 'Kanzlei';
  displayName?: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
} 