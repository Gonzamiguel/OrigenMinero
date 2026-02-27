import { useRef, useState } from 'react';
import { Edit3, Upload, Briefcase, BadgeCheck, Leaf } from 'lucide-react';
import { Modal } from '../components/Modal';
import { SemaforoLegal } from '../components/SemaforoLegal';
import { useApp } from '../context/AppContext';

export function DashboardUsuarioPage() {
  const { perfiles, addToast, cargarDocumento } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const perfil = perfiles[0];
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDocumento, setModalDocumento] = useState(false);
  const [tab, setTab] = useState<'datos' | 'oportunidades'>('datos');
  const [formEditar, setFormEditar] = useState({
    nombre: perfil?.nombre || '',
    descripcion: perfil?.descripcion || '',
  });

  const licitacionesConOportunidad = [
    { id: '1', titulo: 'Provisión de Viandas (Iglesia)', localidad: 'Iglesia', fechaCierre: '2025-03-15' },
    { id: '2', titulo: '5 Camionetas en Iglesia', localidad: 'Iglesia', fechaCierre: '2025-03-20' },
  ];

  const handlePostular = (_licId: string) => {
    addToast('¡Postulación enviada! Tu perfil validado fue enviado a la minera.');
  };

  if (!perfil) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Panel</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('datos')}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === 'datos' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'
            }`}
          >
            Mis Datos
          </button>
          <button
            onClick={() => setTab('oportunidades')}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === 'oportunidades' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'
            }`}
          >
            Oportunidades Local
          </button>
        </div>

        {tab === 'datos' && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{perfil.nombre.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{perfil.empresa || perfil.nombre}</h2>
                    <p className="text-gray-600">{perfil.rubro || perfil.oficio}</p>
                    <div className="flex gap-2 mt-2">
                      {perfil.selloValidado && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                          <BadgeCheck className="w-3 h-3" /> Validado
                        </span>
                      )}
                      {perfil.selloSustentable && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                          <Leaf className="w-3 h-3" /> Sustentable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setModalEditar(true)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-800 hover:bg-slate-100 rounded-lg"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar Perfil
                </button>
              </div>
              <p className="mt-4 text-gray-600">{perfil.descripcion}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Semáforo de Documentos</h3>
              <SemaforoLegal semaforo={perfil.semaforo} />
              <button
                onClick={() => setModalDocumento(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
              >
                <Upload className="w-4 h-4" />
                Actualizar Documento
              </button>
            </div>
          </>
        )}

        {tab === 'oportunidades' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <h3 className="p-4 font-semibold text-gray-900 border-b">
              Licitaciones abiertas en tu zona
            </h3>
            <div className="divide-y">
              {licitacionesConOportunidad.map((l) => (
                <div key={l.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{l.titulo}</p>
                    <p className="text-sm text-gray-500">{l.localidad} • Cierre: {l.fechaCierre}</p>
                  </div>
                  <button
                    onClick={() => handlePostular(l.id)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 text-sm font-medium flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Postular mi Perfil Validado
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalEditar} onClose={() => setModalEditar(false)} title="Editar Perfil">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setModalEditar(false);
            addToast('Perfil actualizado correctamente.');
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              value={formEditar.nombre}
              onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formEditar.descripcion}
              onChange={(e) => setFormEditar({ ...formEditar, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setModalEditar(false)}
              className="px-4 py-2 text-gray-600"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalDocumento}
        onClose={() => setModalDocumento(false)}
        title="Actualizar Documento"
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                cargarDocumento(perfil.id, 'seguro', file);
                setModalDocumento(false);
                e.target.value = '';
              }
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 transition"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Arrastre su PDF aquí</p>
            <p className="text-sm text-gray-500 mt-1">o haga clic para seleccionar</p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setModalDocumento(false)}
              className="px-4 py-2 text-gray-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
