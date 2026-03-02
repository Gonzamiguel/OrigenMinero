import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Redirige usuarios logueados a /dashboard. Solo visitantes pueden ver el contenido. */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500">Cargando...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
