import { LOCALIDADES } from '../../../data/mockData';

export interface DatosPersonalesForm {
  nombreCompleto: string;
  cuil: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  localidad: string;
}

interface TabDatosPersonalesProps {
  form: DatosPersonalesForm;
  onChange: (field: keyof DatosPersonalesForm, value: string) => void;
}

export function TabDatosPersonales({ form, onChange }: TabDatosPersonalesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
        <input
          type="text"
          value={form.nombreCompleto}
          onChange={(e) => onChange('nombreCompleto', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="Ej: Juan Pérez"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">CUIL (XX-XXXXXXXX-X)</label>
        <input
          type="text"
          value={form.cuil}
          onChange={(e) => onChange('cuil', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="20-12345678-9"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
        <input
          type="date"
          value={form.fechaNacimiento}
          onChange={(e) => onChange('fechaNacimiento', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / WhatsApp <span className="text-amber-600">*</span></label>
        <input
          type="text"
          value={form.telefono}
          onChange={(e) => onChange('telefono', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="+54 264 1234567"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="correo@ejemplo.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
        <select
          value={form.localidad}
          onChange={(e) => onChange('localidad', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {LOCALIDADES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
