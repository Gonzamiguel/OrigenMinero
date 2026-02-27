import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'guest' | 'proveedor' | 'profesional' | 'minera' | 'auditor' | 'admin';

interface MockAuthContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  /** true si puede ver contactos y descargar legajos (minera, admin) */
  canViewContacts: boolean;
  /** true si puede ver licitaciones (no guest) */
  canViewLicitaciones: boolean;
  /** true si tiene acceso al dashboard */
  hasDashboardAccess: boolean;
  /** true si es admin */
  isAdmin: boolean;
}

const MockAuthContext = createContext<MockAuthContextType | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('guest');

  const canViewContacts = userRole === 'minera' || userRole === 'admin';
  const canViewLicitaciones = userRole !== 'guest';
  const hasDashboardAccess = ['proveedor', 'profesional', 'minera', 'auditor'].includes(userRole);
  const isAdmin = userRole === 'admin';

  const handleSetRole = useCallback((role: UserRole) => {
    setUserRole(role);
  }, []);

  return (
    <MockAuthContext.Provider
      value={{
        userRole,
        setUserRole: handleSetRole,
        canViewContacts,
        canViewLicitaciones,
        hasDashboardAccess,
        isAdmin,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error('useMockAuth must be used within MockAuthProvider');
  return ctx;
}
