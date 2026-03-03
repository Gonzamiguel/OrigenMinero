import { useMemo, useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { UserCard, is100Compliance } from '../../../components/empresa/UserCard';
import { useEmpresaFavoritos } from '../../../hooks/useEmpresaFavoritos';
import { useApp } from '../../../context/AppContext';
import {
  LOCALIDADES,
  RUBROS_B2B,
  OFICIOS_EXTENDIDOS,
} from '../../../data/mockData';
import type { Perfil } from '../../../types';

const OFICIOS = [...OFICIOS_EXTENDIDOS];
const RUBROS = [...RUBROS_B2B, 'Catering de Campamento', 'Transporte'];

export function EmpresaBuscarPage() {
  const { perfiles, perfilesLoading, perfilesError, refreshPerfiles } = useApp();
  const { isFavorito, toggleFavorito } = useEmpresaFavoritos();

  const [tipoBusqueda, setTipoBusqueda] = useState<'empresa' | 'profesional'>('empresa');
  const [rubro, setRubro] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [soloCompliance, setSoloCompliance] = useState(false);

  const resultados = useMemo(() => {
    let list: Perfil[] = perfiles.filter(
      (p: Perfil) => p.tipo === (tipoBusqueda === 'empresa' ? 'proveedor' : 'profesional')
    );
    if (rubro) {
      list = list.filter((p) =>
        tipoBusqueda === 'empresa'
          ? p.rubro === rubro
          : p.oficio === rubro
      );
    }
    if (localidad) {
      list = list.filter((p) => p.localidad === localidad);
    }
    if (soloCompliance) {
      list = list.filter((p) => is100Compliance(p.semaforo));
    }
    return list;
  }, [perfiles, tipoBusqueda, rubro, localidad, soloCompliance]);

  const opcionesRubro = tipoBusqueda === 'empresa' ? RUBROS : OFICIOS;

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
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Columna Izquierda - Filtros (25%) */}
        <aside className="lg:w-[25%] lg:min-w-[240px] lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Filtros
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Tipo de búsqueda
                </label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTipoBusqueda('empresa')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition ${
                      tipoBusqueda === 'empresa'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Soy Empresa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoBusqueda('profesional')}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition ${
                      tipoBusqueda === 'profesional'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Soy Profesional
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Rubro / Oficio
                </label>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                >
                  <option value="">Todos</option>
                  {opcionesRubro.map((r: string) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Localidad
                </label>
                <select
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                >
                  <option value="">Todas</option>
                  {LOCALIDADES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSoloCompliance(!soloCompliance)}
                  className="flex items-center gap-3 w-full text-left group"
                >
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      soloCompliance ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        soloCompliance ? 'left-6' : 'left-1'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    Mostrar solo proveedores 100% Compliance
                  </span>
                </button>
                <p className="text-xs text-slate-500 mt-1 ml-14">
                  Documentación al día
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Columna Derecha - Resultados (75%) */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900">
              {tipoBusqueda === 'empresa' ? 'Proveedores' : 'Profesionales'}
            </h1>
            <span className="text-sm text-slate-500">
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {resultados.map((perfil) => (
              <UserCard
                key={perfil.id}
                perfil={perfil}
                isFavorito={isFavorito(perfil.id)}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </div>

          {resultados.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">No se encontraron resultados con los filtros aplicados.</p>
              <p className="text-sm text-slate-400 mt-1">Probá ajustar los criterios de búsqueda.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
