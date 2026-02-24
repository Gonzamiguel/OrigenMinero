import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logos/origen-minero.png"
            alt="Origen Minero"
            className="h-9 w-auto"
          />
          <span className="font-bold">Origen Minero</span>
        </Link>
        <div className="flex gap-6 text-sm text-slate-300">
          <Link to="/proveedores" className="hover:text-white transition">Proveedores</Link>
          <Link to="/profesionales" className="hover:text-white transition">Profesionales</Link>
          <Link to="/registro" className="hover:text-white transition">Registro</Link>
        </div>
      </div>
      <p className="text-center text-slate-400 text-sm mt-4">
        © {new Date().getFullYear()} Origen Minero. Alineados con los 4 Pilares de la Ley Minera.
      </p>
    </footer>
  );
}
