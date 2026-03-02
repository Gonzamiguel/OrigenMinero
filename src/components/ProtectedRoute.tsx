import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const LOADING_UI = (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
    <div className="animate-pulse text-slate-500">Cargando...</div>
  </div>
);

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, loading } = useAuth();
  const hasRedirected = useRef(false);

  const waitingForProfile = !!user && userRole === 'guest';
  const needsLogin = !loading && !user;
  const needsRoleRedirect = !loading && !!user && !waitingForProfile && !allowedRoles.includes(userRole);
  const redirectTo = !user ? '/login' : userRole === 'auditor' ? '/dashboard/auditor/pendientes' : '/';

  useEffect(() => {
    if (hasRedirected.current) return;
    if (needsLogin) {
      hasRedirected.current = true;
      navigate('/login', { replace: true, state: { from: location } });
    } else if (needsRoleRedirect) {
      hasRedirected.current = true;
      navigate(redirectTo, { replace: true, state: { from: location } });
    }
  }, [needsLogin, needsRoleRedirect, redirectTo, navigate, location.pathname]);

  if (loading) return LOADING_UI;
  if (!user) return LOADING_UI;
  if (waitingForProfile) return LOADING_UI;
  if (!allowedRoles.includes(userRole)) return LOADING_UI;

  return <>{children}</>;
}
