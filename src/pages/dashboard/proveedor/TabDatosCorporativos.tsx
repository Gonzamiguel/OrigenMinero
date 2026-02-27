import { LOCALIDADES, TIPO_ENTIDAD } from '../../../data/mockData';

export interface DatosCorporativosForm {
  razonSocial: string;
  cuit: string;
  personaContacto: string;
  emailComercial: string;
  telefono: string;
  localidad: string;
  tipoEntidad: string;
}

interface TabDatosCorporativosProps {
  form: DatosCorporativosForm;
  onChange: (field: keyof DatosCorporativosForm, value: string) => void;
}

export function TabDatosCorporativos({ form, onChange }: TabDatosCorporativosProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Razón Social</label>
        <input
          value={form.razonSocial}
          onChange={(e) => onChange('razonSocial', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="Ej: Mendoza Construcciones S.A."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">CUIT (XX-XXXXXXXX-X)</label>
        <input
          value={form.cuit}
          onChange={(e) => onChange('cuit', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="20-12345678-9"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Persona de Contacto / Titular</label>
        <input
          value={form.personaContacto}
          onChange={(e) => onChange('personaContacto', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="Nombre del responsable"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Comercial</label>
        <input
          type="email"
          value={form.emailComercial}
          onChange={(e) => onChange('emailComercial', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="contacto@empresa.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
        <input
          type="tel"
          value={form.telefono}
          onChange={(e) => onChange('telefono', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="+54 264 4567890"
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Entidad</label>
        <select
          value={form.tipoEntidad}
          onChange={(e) => onChange('tipoEntidad', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {TIPO_ENTIDAD.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
