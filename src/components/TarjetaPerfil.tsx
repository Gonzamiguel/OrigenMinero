import { Link } from 'react-router-dom';
import { BadgeCheck, Leaf, MapPin } from 'lucide-react';
import { SemaforoLegal } from './SemaforoLegal';
import type { Perfil } from '../types';

interface TarjetaPerfilProps {
  perfil: Perfil;
  variant?: 'grid' | 'list' | 'compact';
  showContact?: boolean;
}

export function TarjetaPerfil({ perfil, variant = 'grid', showContact = false }: TarjetaPerfilProps) {
  const titulo = perfil.empresa || perfil.nombre;
  const subtitulo = perfil.rubro || perfil.oficio || '';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition ${
        variant === 'compact' ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-slate-800">
            {perfil.tipo === 'proveedor' && perfil.empresa
              ? perfil.empresa.charAt(0)
              : perfil.nombre.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{titulo}</h3>
            {perfil.selloValidado && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                <BadgeCheck className="w-3 h-3" />
                Validado
              </span>
            )}
            {perfil.selloSustentable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                <Leaf className="w-3 h-3" />
                Sustentable
              </span>
            )}
          </div>
          {subtitulo && (
            <p className="text-sm text-gray-600 mt-0.5">{subtitulo}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            {perfil.localidad}
          </div>
          {variant !== 'compact' && (
            <div className="mt-3">
              <SemaforoLegal semaforo={perfil.semaforo} compact />
            </div>
          )}
          {showContact && perfil.telefono && (
            <p className="mt-2 text-sm text-gray-600">📞 {perfil.telefono}</p>
          )}
        </div>
      </div>
      {variant !== 'compact' && (
        <Link
          to={`/perfil/publico/${perfil.id}`}
          className="mt-4 block text-center py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium"
        >
          Ver perfil
        </Link>
      )}
    </div>
  );
}
