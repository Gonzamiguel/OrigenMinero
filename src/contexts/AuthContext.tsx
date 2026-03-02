import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/config';
import { loginUser, logoutUser, registerUser } from '../lib/firebase/authService';
import type { UserRole } from '../lib/firebase/types';

export type AuthUserRole = UserRole | 'guest';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  nombre: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  userRole: AuthUserRole;
  canViewContacts: boolean;
  canViewLicitaciones: boolean;
  hasDashboardAccess: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'proveedor' | 'profesional', nombre: string) => Promise<string>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          uid,
          email: data?.email ?? '',
          role: (data?.role as UserRole) ?? 'proveedor',
          nombre: data?.nombre ?? '',
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        setProfile(userProfile);
        setRole(userProfile?.role ?? null);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserProfile]);

  const userRole: AuthUserRole = role ?? 'guest';
  const canViewContacts = userRole === 'minera' || userRole === 'admin';
  const canViewLicitaciones = userRole !== 'guest';
  const hasDashboardAccess = ['proveedor', 'profesional', 'minera', 'auditor'].includes(userRole);
  const isAdmin = userRole === 'admin';

  const signIn = useCallback(async (email: string, password: string) => {
    await loginUser(email, password);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, selectedRole: 'proveedor' | 'profesional', nombre: string): Promise<string> => {
      return registerUser(email, password, selectedRole, nombre);
    },
    []
  );

  const signOut = useCallback(async () => {
    await logoutUser();
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    role,
    loading,
    userRole,
    canViewContacts,
    canViewLicitaciones,
    hasDashboardAccess,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
