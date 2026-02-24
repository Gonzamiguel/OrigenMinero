import { useState, useMemo } from 'react';
import { TarjetaPerfil } from '../components/TarjetaPerfil';
import { LOCALIDADES, OFICIOS_B2C } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function ProfesionalesPage() {
  const { perfiles } = useApp();
  const [localidad, setLocalidad] = useState('');
  const [oficio, setOficio] = useState('');
  const [soloValidados, setSoloValidados] = useState(false);
  const [selloSustentable, setSelloSustentable] = useState(false);

  const profesionales = useMemo(
    () =>
      perfiles
        .filter((p) => p.tipo === 'profesional')
        .filter((p) => !localidad || p.localidad === localidad)
        .filter((p) => !oficio || p.oficio === oficio)
        .filter((p) => !soloValidados || p.selloValidado)
        .filter((p) => !selloSustentable || p.selloSustentable),
    [perfiles, localidad, oficio, soloValidados, selloSustentable]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profesionales</h1>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Oficio</label>
                <select
                  value={oficio}
                  onChange={(e) => setOficio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todos</option>
                  {OFICIOS_B2C.map((o) => (
                    <option key={o} value={o}>{o}</option>
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
            <p className="text-gray-600 mb-4">{profesionales.length} resultados</p>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {profesionales.map((p) => (
                <TarjetaPerfil key={p.id} perfil={p} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
