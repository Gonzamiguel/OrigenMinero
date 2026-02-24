import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TarjetaPerfil } from '../components/TarjetaPerfil';
import { LOCALIDADES, RUBROS_B2B } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function ProveedoresPage() {
  const [searchParams] = useSearchParams();
  const { perfiles } = useApp();
  const [localidad, setLocalidad] = useState(searchParams.get('localidad') || '');
  const [rubro, setRubro] = useState('');
  const [soloValidados, setSoloValidados] = useState(false);
  const [selloSustentable, setSelloSustentable] = useState(false);

  const proveedores = useMemo(
    () =>
      perfiles
        .filter((p) => p.tipo === 'proveedor')
        .filter((p) => !localidad || p.localidad === localidad)
        .filter((p) => !rubro || p.rubro === rubro)
        .filter((p) => !soloValidados || p.selloValidado)
        .filter((p) => !selloSustentable || p.selloSustentable),
    [perfiles, localidad, rubro, soloValidados, selloSustentable]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Proveedores</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Filtros</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                <select
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todas</option>
                  {LOCALIDADES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rubro</label>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todos</option>
                  {RUBROS_B2B.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloValidados}
                  onChange={(e) => setSoloValidados(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Solo perfiles validados</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selloSustentable}
                  onChange={(e) => setSelloSustentable(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Sello Sustentable (Medio Ambiente)</span>
              </label>
            </div>
          </aside>
          <main className="flex-1">
            <p className="text-gray-600 mb-4">{proveedores.length} resultados</p>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {proveedores.map((p) => (
                <TarjetaPerfil key={p.id} perfil={p} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
