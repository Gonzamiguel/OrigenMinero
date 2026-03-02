import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const marketingLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/proveedores', label: 'Proveedores' },
  { to: '/profesionales', label: 'Profesionales' },
];

/** Visitantes solo ven Inicio (no Proveedores ni Profesionales). */
const linksParaVisitantes = marketingLinks.filter((l) => l.to === '/');

export function Navbar() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split('?')[0]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileOpen(false);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

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
            {!user ? (
              <>
                {linksParaVisitantes.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(to) ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-500 transition"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-slate-600">
                  Bienvenido, <span className="font-medium text-slate-800">{profile?.nombre || user.email}</span>
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar sesión
                </button>
              </>
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
            {!user ? (
              <>
                {linksParaVisitantes.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(to) ? 'bg-slate-800 text-white' : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-500"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-2 text-sm text-slate-600">
                  Bienvenido, <span className="font-medium text-slate-800">{profile?.nombre || user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
