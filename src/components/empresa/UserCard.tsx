import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import type { Perfil } from '../../types';

export function is100Compliance(semaforo: Perfil['semaforo']): boolean {
  const values = Object.values(semaforo).filter(Boolean);
  return values.length > 0 && values.every((v) => v === 'ok');
}

function getComplianceBadge(semaforo: Perfil['semaforo']): { label: string; className: string } {
  const values = Object.values(semaforo).filter(Boolean);
  const allOk = values.length > 0 && values.every((v) => v === 'ok');
  const hasPending = values.some((v) => v === 'en_revision' || v === 'pendiente');
  const hasVencido = values.some((v) => v === 'vencido');

  if (allOk) return { label: '100% Compliance', className: 'bg-emerald-100 text-emerald-700' };
  if (hasVencido) return { label: 'Pendiente', className: 'bg-red-100 text-red-700' };
  if (hasPending) return { label: 'En revisión', className: 'bg-amber-100 text-amber-700' };
  return { label: 'Pendiente', className: 'bg-slate-100 text-slate-600' };
}

interface UserCardProps {
  perfil: Perfil;
  isFavorito?: boolean;
  onToggleFavorito?: (id: string) => void;
}

export function UserCard({ perfil, isFavorito = false, onToggleFavorito }: UserCardProps) {
  const titulo = perfil.empresa || perfil.nombre;
  const subtitulo = perfil.rubro || perfil.oficio || '';
  const badge = getComplianceBadge(perfil.semaforo);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow relative group">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorito?.(perfil.id);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-lg transition ${
          isFavorito
            ? 'text-amber-500 bg-amber-50'
            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-50'
        }`}
        aria-label={isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Star className={`w-5 h-5 ${isFavorito ? 'fill-current' : ''}`} />
      </button>

      <div className="p-4">
        <div className="pr-10">
          <h3 className="font-semibold text-slate-900 text-lg">{titulo}</h3>
          {subtitulo && (
            <p className="text-sm text-slate-600 mt-0.5">{subtitulo}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            {perfil.localidad}
          </div>
        </div>

        <span
          className={`inline-flex mt-3 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>

        <Link
          to={`/dashboard/empresa/perfil/${perfil.id}`}
          className="mt-4 block w-full text-center py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition text-sm font-medium"
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  );
}
