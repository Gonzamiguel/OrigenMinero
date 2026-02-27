import { OFICIOS_EXTENDIDOS, LICENCIAS_CONDUCIR, CERTIFICACIONES_SEGURIDAD, NIVEL_EDUCACION } from '../../../data/mockData';

export interface CredencialesTecnicasForm {
  oficio: string;
  licenciaConducir: string;
  certificaciones: string[];
  nivelEducacion: string;
}

interface TabCredencialesTecnicasProps {
  form: CredencialesTecnicasForm;
  onChange: (field: keyof CredencialesTecnicasForm, value: string | string[]) => void;
}

export function TabCredencialesTecnicas({ form, onChange }: TabCredencialesTecnicasProps) {
  const toggleCertificacion = (id: string) => {
    const next = form.certificaciones.includes(id)
      ? form.certificaciones.filter((c) => c !== id)
      : [...form.certificaciones, id];
    onChange('certificaciones', next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Oficio / Especialidad Principal</label>
        <select
          value={form.oficio}
          onChange={(e) => onChange('oficio', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {OFICIOS_EXTENDIDOS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Licencia de Conducir</label>
        <select
          value={form.licenciaConducir}
          onChange={(e) => onChange('licenciaConducir', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          {LICENCIAS_CONDUCIR.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nivel de Educación</label>
        <select
          value={form.nivelEducacion}
          onChange={(e) => onChange('nivelEducacion', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {NIVEL_EDUCACION.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-3">Certificaciones de Seguridad</label>
        <div className="flex flex-wrap gap-4">
          {CERTIFICACIONES_SEGURIDAD.map((c) => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.certificaciones.includes(c.id)}
                onChange={() => toggleCertificacion(c.id)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700">{c.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
