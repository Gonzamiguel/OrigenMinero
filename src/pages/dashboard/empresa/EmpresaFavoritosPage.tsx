import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { UserCard } from '../../../components/empresa/UserCard';
import { useEmpresaFavoritos } from '../../../hooks/useEmpresaFavoritos';
import { useApp } from '../../../context/AppContext';
import type { Perfil } from '../../../types';

export function EmpresaFavoritosPage() {
  const { perfiles, perfilesLoading, perfilesError, refreshPerfiles } = useApp();
  const { favoritos, isFavorito, toggleFavorito } = useEmpresaFavoritos();

  const perfilesFavoritos = useMemo(
    () => perfiles.filter((p: Perfil) => favoritos.includes(p.id)),
    [perfiles, favoritos]
  );

  if (perfilesLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (perfilesError) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl border border-red-200 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{perfilesError}</p>
          <button
            onClick={refreshPerfiles}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mis Favoritos</h1>
            <p className="text-sm text-slate-500">
              {perfilesFavoritos.length} proveedor{perfilesFavoritos.length !== 1 ? 'es' : ''} guardado{perfilesFavoritos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {perfilesFavoritos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {perfilesFavoritos.map((perfil: Perfil) => (
              <UserCard
                key={perfil.id}
                perfil={perfil}
                isFavorito={isFavorito(perfil.id)}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-700">Aún no tenés favoritos</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Marcá con la estrella los proveedores o profesionales que te interesen en el Buscador de Red para verlos aquí.
            </p>
            <Link
              to="/dashboard/empresa/buscar"
              className="inline-block mt-6 px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition"
            >
              Ir al Buscador
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
