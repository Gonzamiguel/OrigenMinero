import { useState } from 'react';
import { Plus, Users, MapPin, Calendar } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';

export function LicitacionesPage() {
  const { licitaciones, perfiles, addLicitacion, addToast } = useApp();
  const [modalNueva, setModalNueva] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [fechaCierre, setFechaCierre] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLicitacion({ titulo, descripcion, localidad, fechaCierre });
    setTitulo('');
    setDescripcion('');
    setLocalidad('');
    setFechaCierre('');
    setModalNueva(false);
    addToast('Oportunidad publicada correctamente.');
  };

  const getPostulante = (id: string) => perfiles.find((p) => p.id === id);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Licitaciones / Oportunidades</h1>
          <button
            onClick={() => setModalNueva(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
          >
            <Plus className="w-4 h-4" />
            Publicar Nueva Oportunidad
          </button>
        </div>

        <div className="space-y-4">
          {licitaciones.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h3 className="font-semibold text-gray-900 text-lg">{l.titulo}</h3>
              <p className="text-gray-600 mt-1">{l.descripcion}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {l.localidad}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Cierre: {l.fechaCierre}
                </span>
              </div>
              {l.postulantes.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    {l.postulantes.length} postulante(s)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {l.postulantes.map((pid) => {
                      const p = getPostulante(pid);
                      return p ? (
                        <span
                          key={pid}
                          className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                        >
                          {p.empresa || p.nombre}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalNueva}
        onClose={() => setModalNueva(false)}
        title="Publicar Nueva Oportunidad"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: Busco 5 Camionetas en Iglesia"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cierre</label>
            <input
              type="date"
              value={fechaCierre}
              onChange={(e) => setFechaCierre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setModalNueva(false)}
              className="px-4 py-2 text-gray-600"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500">
              Publicar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
