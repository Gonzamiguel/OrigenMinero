import { useState } from 'react';
import { ChevronRight, ChevronLeft, Upload } from 'lucide-react';

const PASOS = ['Cuenta', 'Datos Comerciales', 'Documentos'];

export function RegistroPage() {
  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState({
    email: '',
    password: '',
    tipo: 'proveedor' as 'proveedor' | 'profesional',
    nombre: '',
    empresa: '',
    rubro: '',
    localidad: '',
    documentos: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paso < 2) setPaso((p) => p + 1);
    else alert('Registro simulado completado. Redirigiendo...');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4 flex flex-col justify-center">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Registro</h1>
        <p className="text-gray-600 mb-8">Complete los 3 pasos para crear su cuenta</p>

        <div className="flex gap-2 mb-8">
          {PASOS.map((p, i) => (
            <div
              key={p}
              className={`flex-1 h-2 rounded-full ${
                i <= paso ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
          {paso === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as 'proveedor' | 'profesional' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="proveedor">Proveedor (Empresa)</option>
                  <option value="profesional">Profesional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {form.tipo === 'proveedor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    value={form.empresa}
                    onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                <select
                  value={form.localidad}
                  onChange={(e) => setForm({ ...form, localidad: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccione</option>
                  <option value="Rodeo">Rodeo</option>
                  <option value="Tudcum">Tudcum</option>
                  <option value="Jáchal">Jáchal</option>
                  <option value="Calingasta">Calingasta</option>
                  <option value="Ciudad de San Juan">Ciudad de San Juan</option>
                </select>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Arrastre su PDF aquí</p>
                <p className="text-sm text-gray-500 mt-1">o haga clic para seleccionar archivos</p>
                <p className="text-xs text-gray-400 mt-2">AFIP, ART, Seguro (PDF)</p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setPaso((p) => Math.max(0, p - 1))}
              disabled={paso === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
            >
              {paso === 2 ? 'Finalizar' : 'Siguiente'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
