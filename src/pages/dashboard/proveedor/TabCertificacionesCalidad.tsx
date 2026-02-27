import { NORMAS_ISO } from '../../../data/mockData';

export interface CertificacionesCalidadForm {
  normasISO: string[];
  registroProvincial: boolean;
  programaRSEActivo: boolean;
}

interface TabCertificacionesCalidadProps {
  form: CertificacionesCalidadForm;
  onChange: (field: keyof CertificacionesCalidadForm, value: string[] | boolean) => void;
}

export function TabCertificacionesCalidad({ form, onChange }: TabCertificacionesCalidadProps) {
  const toggleISO = (id: string) => {
    const next = form.normasISO.includes(id)
      ? form.normasISO.filter((n) => n !== id)
      : [...form.normasISO, id];
    onChange('normasISO', next);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Normas ISO</label>
        <div className="flex flex-wrap gap-4">
          {NORMAS_ISO.map((n) => (
            <label key={n.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.normasISO.includes(n.id)}
                onChange={() => toggleISO(n.id)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700">{n.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Registros Provinciales</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.registroProvincial}
            onChange={(e) => onChange('registroProvincial', e.target.checked)}
            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-slate-700">Inscrito en Registro de Proveedores Locales</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Programa de RSE Activo</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rse"
              checked={form.programaRSEActivo === true}
              onChange={() => onChange('programaRSEActivo', true)}
              className="text-amber-600"
            />
            <span className="text-slate-700">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rse"
              checked={form.programaRSEActivo === false}
              onChange={() => onChange('programaRSEActivo', false)}
              className="text-amber-600"
            />
            <span className="text-slate-700">No</span>
          </label>
        </div>
      </div>
    </div>
  );
}
