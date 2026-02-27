import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useMockAuth } from '../context/MockAuthContext';
import { getNavbarDashboardLink } from '../config/dashboardLinks';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/proveedores', label: 'Proveedores' },
  { to: '/profesionales', label: 'Profesionales' },
  { to: '/registro', label: 'Registro' },
];

export function Navbar() {
  const location = useLocation();
  const { userRole, hasDashboardAccess, isAdmin } = useMockAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showPrivateNav = hasDashboardAccess || isAdmin;
  const dashboardLink = getNavbarDashboardLink(userRole);
  const DashboardIcon = dashboardLink?.icon;

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split('?')[0]);

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logos/origen-minero.png"
              alt="Origen Minero"
              className="h-10 w-auto"
            />
            <span className="font-bold text-lg text-slate-800">Origen Minero</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg w-fit leading-none min-h-[32px] ${
                  isActive(to)
                    ? 'bg-slate-800 text-white shadow-lg'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {label}
              </Link>
            ))}
            {showPrivateNav &&
              dashboardLink &&
              DashboardIcon && (
                <Link
                  to={dashboardLink.to}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg w-fit leading-none min-h-[32px] ${
                    isActive(dashboardLink.to)
                      ? 'bg-slate-800 text-white shadow-lg'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <DashboardIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {dashboardLink.label}
                </Link>
              )}
          </div>

          <button
            className="md:hidden p-2 text-slate-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-full text-sm font-medium ${
                  isActive(to) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {label}
              </Link>
            ))}
            {showPrivateNav &&
              dashboardLink &&
              DashboardIcon && (
                <Link
                  to={dashboardLink.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium ${
                    isActive(dashboardLink.to) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <DashboardIcon className="w-4 h-4" />
                  {dashboardLink.label}
                </Link>
              )}
          </div>
        )}
      </div>
    </nav>
  );
}
