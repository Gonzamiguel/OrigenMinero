import { useState, useMemo } from 'react';
import { X, Download, Phone } from 'lucide-react';
import { SemaforoLegal } from '../components/SemaforoLegal';
import { LOCALIDADES, RUBROS_B2B, OFICIOS_B2C } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useMockAuth } from '../context/MockAuthContext';
import { descargarLegajo } from '../utils/descargarLegajo';
import type { Perfil } from '../types';

export function BuscarPage() {
  const { perfiles, historialDocumentos, addToast } = useApp();
  const { canViewContacts } = useMockAuth();
  const [localidad, setLocalidad] = useState('');
  const [rubro, setRubro] = useState('');
  const [tipo, setTipo] = useState<'proveedor' | 'profesional'>('proveedor');
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Perfil | null>(null);

  const resultados = useMemo(
    () =>
      perfiles
        .filter((p) => p.tipo === tipo)
        .filter((p) => !localidad || p.localidad === localidad)
        .filter((p) =>
          tipo === 'proveedor'
            ? !rubro || p.rubro === rubro
            : !rubro || p.oficio === rubro
        ),
    [perfiles, tipo, localidad, rubro]
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-1">
      <div className="flex-1 py-8 px-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Buscador avanzado</h1>
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-4">
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'proveedor' | 'profesional')}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="proveedor">Proveedores</option>
              <option value="profesional">Profesionales</option>
            </select>
            <select
              value={localidad}
              onChange={(e) => setLocalidad(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todas las localidades</option>
              {LOCALIDADES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los rubros</option>
              {(tipo === 'proveedor' ? RUBROS_B2B : OFICIOS_B2C).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <p className="text-gray-600 mb-4">{resultados.length} resultados</p>
          <div className="space-y-3">
            {resultados.map((p) => (
              <div
                key={p.id}
                onClick={() => setPerfilSeleccionado(p)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition ${
                  perfilSeleccionado?.id === p.id
                    ? 'border-slate-800 ring-2 ring-slate-800/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{p.empresa || p.nombre}</h3>
                    <p className="text-sm text-gray-600">{p.rubro || p.oficio} • {p.localidad}</p>
                    {p.telefono && (
                      <p className="text-sm text-amber-600 mt-1">📞 {p.telefono}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {perfilSeleccionado && (
        <div className="w-full lg:w-[400px] bg-white border-l border-slate-200 flex flex-col fixed right-0 top-16 bottom-0 z-40 shadow-xl">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Detalle del perfil</h3>
            <button
              onClick={() => setPerfilSeleccionado(null)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="flex gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">
                  {perfilSeleccionado.nombre.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{perfilSeleccionado.empresa || perfilSeleccionado.nombre}</h3>
                <p className="text-sm text-gray-600">{perfilSeleccionado.rubro || perfilSeleccionado.oficio}</p>
                <p className="text-sm text-gray-500">{perfilSeleccionado.localidad}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{perfilSeleccionado.descripcion}</p>
            <SemaforoLegal semaforo={perfilSeleccionado.semaforo} />
            <div className="mt-6 space-y-2">
              {canViewContacts && perfilSeleccionado.telefono && (
                <a
                  href={`tel:${perfilSeleccionado.telefono}`}
                  className="flex items-center gap-2 w-full py-2 px-4 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                >
                  <Phone className="w-4 h-4" />
                  {perfilSeleccionado.telefono}
                </a>
              )}
              {canViewContacts &&
                Object.values(perfilSeleccionado.semaforo).every((e) => e === 'ok') && (
                  <button
                    onClick={async () => {
                      try {
                        const historialFiltrado = historialDocumentos.filter((h) => h.perfilId === perfilSeleccionado.id);
                        await descargarLegajo(perfilSeleccionado, historialFiltrado);
                        addToast('Legajo descargado correctamente.');
                      } catch {
                        addToast('Error al descargar el legajo.', 'error');
                      }
                    }}
                    className="flex items-center gap-2 w-full py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Legajo (.ZIP)
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
