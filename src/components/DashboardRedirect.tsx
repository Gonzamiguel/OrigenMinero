import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PATH_BY_ROLE: Record<string, string> = {
  proveedor: '/dashboard/documentos',
  profesional: '/dashboard/profesional/documentos',
  minera: '/dashboard/empresa/buscar',
  auditor: '/dashboard/auditor/pendientes',
  admin: '/admin-gonzalo',
};

export function DashboardRedirect() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userRole } = useAuth();

  const targetPath = PATH_BY_ROLE[userRole] ?? '/dashboard/documentos';

  useEffect(() => {
    if (pathname === '/dashboard' && userRole !== 'guest') {
      navigate(targetPath, { replace: true });
    }
  }, [pathname, targetPath, navigate, userRole]);

  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-pulse text-slate-500">Redirigiendo...</div>
    </div>
  );
}
