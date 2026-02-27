import { Outlet, Link, useLocation } from 'react-router-dom';
import { useMockAuth } from '../context/MockAuthContext';
import { getLinksForRole } from '../config/dashboardLinks';

export function DashboardLayout() {
  const { userRole, canViewLicitaciones } = useMockAuth();
  const location = useLocation();
  const links = getLinksForRole(userRole, canViewLicitaciones);

  const isActive = (path: string) => {
    const fullPath = location.pathname + (location.search || '');
    if (path.includes('?')) {
      return fullPath === path;
    }
    return path === location.pathname && !location.search;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-slate-50">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 p-4">
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive(to)
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
