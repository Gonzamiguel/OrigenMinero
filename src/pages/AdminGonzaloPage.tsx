import { useState } from 'react';
import { UserPlus, Shield, Users, Zap, AlertTriangle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';
import { LOCALIDADES } from '../data/mockData';

const AUDITORES_MOCK = [
  { id: '1', nombre: 'Sun Solutions', email: 'auditoria@sunsolutions.com', activo: true },
  { id: '2', nombre: 'CADEMI', email: 'validacion@cademi.gov.ar', activo: true },
];

export function AdminGonzaloPage() {
  const { addToast } = useApp();
  const [modalMinera, setModalMinera] = useState(false);
  const [modalForzar, setModalForzar] = useState(false);
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [localidad, setLocalidad] = useState('');

  const handleCrearMinera = (e: React.FormEvent) => {
    e.preventDefault();
    setNombreEmpresa('');
    setEmail('');
    setLocalidad('');
    setModalMinera(false);
    addToast('Cuenta Minera creada correctamente.');
  };

  const handleSuspender = (nombre: string) => {
    addToast(`Acceso de ${nombre} suspendido.`, 'info');
  };

  const handleForzarValidacion = () => {
    setModalForzar(false);
    addToast('Validación forzada. El proveedor recibirá notificación.', 'info');
  };

  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-slate-800">Panel Admin</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">150</p>
                <p className="text-sm text-slate-600">Proveedores Registrados</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">12</p>
                <p className="text-sm text-slate-600">Pases a Premium este mes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crear cuenta Minera */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-slate-600" />
            Crear nueva cuenta Minera
          </h2>
          <button
            onClick={() => setModalMinera(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium"
          >
            Crear cuenta
          </button>
        </section>

        {/* Auditores activos */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            Auditores activos
          </h2>
          <div className="space-y-3">
            {AUDITORES_MOCK.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-4 border border-slate-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-800">{a.nombre}</p>
                  <p className="text-sm text-slate-500">{a.email}</p>
                </div>
                <button
                  onClick={() => handleSuspender(a.nombre)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                >
                  Suspender acceso
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Botón emergencia */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <button
            onClick={() => setModalForzar(true)}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 font-semibold"
          >
            <AlertTriangle className="w-5 h-5" />
            Forzar Validación de Proveedor
          </button>
        </section>
      </div>

      <Modal isOpen={modalMinera} onClose={() => setModalMinera(false)} title="Crear cuenta Minera">
        <form onSubmit={handleCrearMinera} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la empresa</label>
            <input
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Localidad principal</label>
            <select
              value={localidad}
              onChange={(e) => setLocalidad(e.target.value)}
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
            <button type="button" onClick={() => setModalMinera(false)} className="px-4 py-2 text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
              Crear
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalForzar} onClose={() => setModalForzar(false)} title="Forzar Validación">
        <div className="space-y-4">
          <p className="text-slate-600">
            Esta acción marcará al proveedor como validado sin pasar por el flujo normal de auditoría. ¿Continuar?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setModalForzar(false)}
              className="px-4 py-2 text-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleForzarValidacion}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
            >
              Forzar Validación
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
