import { Navigate } from 'react-router-dom';
import { useMockAuth } from '../context/MockAuthContext';

export function DashboardRedirect() {
  const { userRole } = useMockAuth();

  const pathMap: Record<string, string> = {
    proveedor: '/dashboard/proveedor',
    profesional: '/dashboard/profesional/perfil',
    minera: '/dashboard/minera',
    auditor: '/dashboard/auditor',
  };

  const path = pathMap[userRole] || '/dashboard/proveedor';
  return <Navigate to={path} replace />;
}
