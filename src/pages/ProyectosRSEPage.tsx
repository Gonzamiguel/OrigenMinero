import { useState } from 'react';
import { Plus, FileDown, MapPin } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';

export function ProyectosRSEPage() {
  const { proyectosRSE, addProyectoRSE, addToast } = useApp();
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nombreObra, setNombreObra] = useState('');
  const [localidad, setLocalidad] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProyectoRSE({
      nombre: nombreObra,
      localidad,
      descripcion: 'Proyecto comunitario',
      fechaInicio: new Date().toISOString().split('T')[0],
      estado: 'activo',
    });
    setNombreObra('');
    setLocalidad('');
    setModalNuevo(false);
    addToast('Proyecto comunitario creado exitosamente.');
  };

  const handleExportar = () => {
    addToast('Reporte de Impacto RSE exportado correctamente.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Proyectos RSE</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setModalNuevo(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
            >
              <Plus className="w-4 h-4" />
              Nuevo Proyecto Comunitario
            </button>
            <button
              onClick={handleExportar}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              <FileDown className="w-4 h-4" />
              Exportar Reporte de Impacto RSE
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y">
            {proyectosRSE.map((p) => (
              <div key={p.id} className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {p.localidad}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{p.descripcion}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.estado === 'activo' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalNuevo}
        onClose={() => setModalNuevo(false)}
        title="Nuevo Proyecto Comunitario"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Obra</label>
            <input
              value={nombreObra}
              onChange={(e) => setNombreObra(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
            <select
              value={localidad}
              onChange={(e) => setLocalidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Seleccione</option>
              <option value="Rodeo">Rodeo</option>
              <option value="Tudcum">Tudcum</option>
              <option value="Jáchal">Jáchal</option>
              <option value="Calingasta">Calingasta</option>
              <option value="Iglesia">Iglesia</option>
              <option value="Ciudad de San Juan">Ciudad de San Juan</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setModalNuevo(false)}
              className="px-4 py-2 text-gray-600"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500">
              Crear
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
