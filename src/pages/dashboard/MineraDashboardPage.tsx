import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { DossierProfesionalMinera } from '../../components/DossierProfesionalMinera';
import { DossierProveedorMinera } from '../../components/DossierProveedorMinera';
import { LOCALIDADES, RUBROS_B2B, OFICIOS_B2C } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import type { Perfil } from '../../types';

export function MineraDashboardPage() {
  const { perfiles, licitaciones, proyectosRSE, historialDocumentos, addLicitacion, addProyectoRSE, addToast } = useApp();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<'buscar' | 'licitaciones' | 'rse'>(
    tabParam === 'rse' ? 'rse' : tabParam === 'licitaciones' ? 'licitaciones' : 'buscar'
  );

  useEffect(() => {
    if (tabParam === 'rse') setTab('rse');
    else if (tabParam === 'licitaciones') setTab('licitaciones');
    else setTab('buscar');
  }, [tabParam]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<Perfil | null>(null);
  const historialFiltrado = perfilSeleccionado
    ? historialDocumentos.filter((h) => h.perfilId === perfilSeleccionado.id)
    : [];
  const [localidad, setLocalidad] = useState('');
  const [rubro, setRubro] = useState('');
  const [tipo, setTipo] = useState<'proveedor' | 'profesional'>('proveedor');
  const [modalLicitacion, setModalLicitacion] = useState(false);
  const [modalRSE, setModalRSE] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [licLocalidad, setLicLocalidad] = useState('');
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [montoInvertido, setMontoInvertido] = useState('');
  const [estadoRSE, setEstadoRSE] = useState<'activo' | 'completado'>('activo');

  const resultados = useMemo(
    () =>
      perfiles
        .filter((p) => p.tipo === tipo)
        .filter((p) => !localidad || p.localidad === localidad)
        .filter((p) =>
          tipo === 'proveedor' ? !rubro || p.rubro === rubro : !rubro || p.oficio === rubro
        ),
    [perfiles, tipo, localidad, rubro]
  );

  const handleAddLicitacion = (e: React.FormEvent) => {
    e.preventDefault();
    addLicitacion({
      titulo,
      descripcion: 'Oportunidad publicada desde dashboard',
      localidad: licLocalidad,
      fechaCierre: fechaLimite,
    });
    setTitulo('');
    setFechaLimite('');
    setLicLocalidad('');
    setModalLicitacion(false);
    addToast('Licitación publicada correctamente.');
  };

  const handleAddRSE = (e: React.FormEvent) => {
    e.preventDefault();
    addProyectoRSE({
      nombre: nombreProyecto,
      localidad: licLocalidad,
      descripcion: `Inversión: $${montoInvertido || '0'}`,
      fechaInicio: new Date().toISOString().split('T')[0],
      estado: estadoRSE,
      montoInvertido: montoInvertido ? Number(montoInvertido) : undefined,
    });
    setNombreProyecto('');
    setMontoInvertido('');
    setModalRSE(false);
    addToast('Proyecto RSE registrado.');
  };

  return (
    <div className="py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-2 mb-6">
          {(['buscar', 'licitaciones', 'rse'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                tab === t ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'buscar' ? 'Buscador' : t === 'licitaciones' ? 'Licitaciones' : 'Tracker RSE'}
            </button>
          ))}
        </div>

        {tab === 'buscar' && (
          <div className="flex flex-1 gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Buscador sin límites</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-4">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as 'proveedor' | 'profesional')}
                  className="px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="proveedor">Proveedores</option>
                  <option value="profesional">Profesionales</option>
                </select>
                <select
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">Todas las localidades</option>
                  {LOCALIDADES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">Todos</option>
                  {(tipo === 'proveedor' ? RUBROS_B2B : OFICIOS_B2C).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                {resultados.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPerfilSeleccionado(p)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer transition ${
                      perfilSeleccionado?.id === p.id ? 'border-slate-800 ring-2 ring-slate-800/20' : 'border-slate-200'
                    }`}
                  >
                    <h3 className="font-semibold">{p.empresa || p.nombre}</h3>
                    <p className="text-sm text-slate-600">{p.rubro || p.oficio} • {p.localidad}</p>
                    {p.telefono && <p className="text-sm text-amber-600 mt-1">📞 {p.telefono}</p>}
                  </div>
                ))}
              </div>
            </div>

            {perfilSeleccionado && perfilSeleccionado.tipo === 'profesional' && (
              <DossierProfesionalMinera
                perfil={perfilSeleccionado}
                historialFiltrado={historialFiltrado}
                addToast={addToast}
                variant="modal"
                onClose={() => setPerfilSeleccionado(null)}
                onDescargar={() => setPerfilSeleccionado(null)}
              />
            )}
            {perfilSeleccionado && perfilSeleccionado.tipo === 'proveedor' && (
              <DossierProveedorMinera
                perfil={perfilSeleccionado}
                historialFiltrado={historialFiltrado}
                addToast={addToast}
                variant="modal"
                onClose={() => setPerfilSeleccionado(null)}
                onDescargar={() => setPerfilSeleccionado(null)}
              />
            )}
          </div>
        )}

        {tab === 'licitaciones' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Licitaciones Rápidas</h2>
              <button
                onClick={() => setModalLicitacion(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
              >
                <Plus className="w-4 h-4" />
                Publicar Oportunidad
              </button>
            </div>
            <div className="space-y-4">
              {licitaciones.map((l) => (
                <div key={l.id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800">{l.titulo}</h3>
                  <p className="text-slate-600 mt-1">{l.descripcion}</p>
                  <p className="text-sm text-slate-500 mt-2">{l.localidad} • Cierre: {l.fechaCierre}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'rse' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Inversión Social / RSE</h2>
              <button
                onClick={() => setModalRSE(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
              >
                <Plus className="w-4 h-4" />
                Nuevo Proyecto
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-medium text-slate-700">Proyecto</th>
                    <th className="text-left p-4 font-medium text-slate-700">Monto</th>
                    <th className="text-left p-4 font-medium text-slate-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectosRSE.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{p.nombre}</p>
                        <p className="text-sm text-slate-500">{p.localidad}</p>
                      </td>
                      <td className="p-4 text-slate-600">{p.montoInvertido ? `$${p.montoInvertido}` : '-'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.estado === 'activo' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={modalLicitacion} onClose={() => setModalLicitacion(false)} title="Publicar Licitación Rápida">
        <form onSubmit={handleAddLicitacion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título de la necesidad</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="Ej: 5 Camionetas en Iglesia"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha límite</label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
            <select
              value={licLocalidad}
              onChange={(e) => setLicLocalidad(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            >
              <option value="">Seleccione</option>
              {LOCALIDADES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setModalLicitacion(false)} className="px-4 py-2 text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500">
              Publicar
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalRSE} onClose={() => setModalRSE(false)} title="Registrar Inversión Social">
        <form onSubmit={handleAddRSE} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del proyecto comunitario</label>
            <input
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monto invertido ($)</label>
            <input
              type="number"
              value={montoInvertido}
              onChange={(e) => setMontoInvertido(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
            <select
              value={licLocalidad}
              onChange={(e) => setLicLocalidad(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            >
              <option value="">Seleccione</option>
              {LOCALIDADES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <select
              value={estadoRSE}
              onChange={(e) => setEstadoRSE(e.target.value as 'activo' | 'completado')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              <option value="activo">Activo</option>
              <option value="completado">Completado</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setModalRSE(false)} className="px-4 py-2 text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500">
              Registrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
