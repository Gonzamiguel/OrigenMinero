import { Navigate, useLocation } from 'react-router-dom';
import { useMockAuth } from '../context/MockAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { userRole } = useMockAuth();
  const location = useLocation();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
