import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, X, User, ExternalLink } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { useApp } from '../../../context/AppContext';
import { LOCALIDADES } from '../../../data/mockData';
import type { Licitacion, Perfil } from '../../../types';

export function EmpresaLicitacionesPage() {
  const { licitaciones, perfiles, addLicitacion, addToast } = useApp();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [licitacionPostulantes, setLicitacionPostulantes] = useState<Licitacion | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLicitacion({
      titulo,
      descripcion,
      localidad: ubicacion,
      fechaCierre,
    });
    setTitulo('');
    setDescripcion('');
    setUbicacion('');
    setFechaCierre('');
    setModalAbierto(false);
    addToast('Licitación creada correctamente.');
  };

  const postulantesPerfiles = useMemo(() => {
    if (!licitacionPostulantes) return [];
    return licitacionPostulantes.postulantes
      .map((id) => perfiles.find((p: Perfil) => p.id === id))
      .filter(Boolean) as Perfil[];
  }, [licitacionPostulantes, perfiles]);

  return (
    <div className="py-6 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Mis Licitaciones</h1>
              <p className="text-sm text-slate-500">Gestioná tus oportunidades y postulantes</p>
            </div>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition"
          >
            <Plus className="w-5 h-5" />
            Nueva Licitación
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Título</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Ubicación</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Fecha de cierre</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Postulantes</th>
                </tr>
              </thead>
              <tbody>
                {licitaciones.map((lic: Licitacion) => (
                  <tr key={lic.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{lic.titulo}</p>
                      <p className="text-sm text-slate-500 line-clamp-1">{lic.descripcion}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{lic.localidad}</td>
                    <td className="px-6 py-4 text-slate-600">{lic.fechaCierre}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => lic.postulantes.length > 0 && setLicitacionPostulantes(lic)}
                        disabled={lic.postulantes.length === 0}
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium transition ${
                          lic.postulantes.length > 0
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-default'
                        }`}
                      >
                        {lic.postulantes.length} postulante{lic.postulantes.length !== 1 ? 's' : ''}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {licitaciones.length === 0 && (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aún no tenés licitaciones publicadas.</p>
              <button
                onClick={() => setModalAbierto(true)}
                className="mt-4 text-emerald-600 font-medium hover:text-emerald-500"
              >
                Crear la primera
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Nueva Licitación"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              placeholder="Ej: Provisión de Viandas para Campamento"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-400 min-h-[100px]"
              placeholder="Detalles de la necesidad..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
            <select
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              required
            >
              <option value="">Seleccione localidad</option>
              {LOCALIDADES.map((l: string) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de cierre</label>
            <input
              type="date"
              value={fechaCierre}
              onChange={(e) => setFechaCierre(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              required
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium"
            >
              Crear Licitación
            </button>
          </div>
        </form>
      </Modal>

      {/* Panel lateral de postulantes */}
      {licitacionPostulantes && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setLicitacionPostulantes(null)}
            aria-hidden="true"
          />
          <aside
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            style={{ animation: 'slideIn 0.25s ease-out' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Postulantes</h2>
                <p className="text-sm text-slate-500">{licitacionPostulantes.titulo}</p>
              </div>
              <button
                type="button"
                onClick={() => setLicitacionPostulantes(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {postulantesPerfiles.length > 0 ? (
                <ul className="space-y-3">
                  {postulantesPerfiles.map((p: Perfil) => (
                    <li
                      key={p.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">
                            {p.empresa || p.nombre}
                          </p>
                          <p className="text-sm text-slate-600">
                            {p.rubro || p.oficio} • {p.localidad}
                          </p>
                          <Link
                            to={`/dashboard/empresa/perfil/${p.id}`}
                            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-500"
                          >
                            Ver perfil
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No se encontraron datos de los postulantes.
                </p>
              )}
            </div>
          </aside>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
