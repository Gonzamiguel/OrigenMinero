import { SITUACION_LABORAL, DIAGRAMA_ROSTER, EXPERIENCIA_MINERIA } from '../../../data/mockData';

export interface PerfilOperativoForm {
  situacionLaboral: string;
  diagramaRoster: string;
  pernocteCampamento: boolean | null;
  experienciaMineria: string;
}

interface TabPerfilOperativoProps {
  form: PerfilOperativoForm;
  onChange: (field: keyof PerfilOperativoForm, value: string | boolean) => void;
}

export function TabPerfilOperativo({ form, onChange }: TabPerfilOperativoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Situación Laboral</label>
        <select
          value={form.situacionLaboral}
          onChange={(e) => onChange('situacionLaboral', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {SITUACION_LABORAL.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidad de Diagrama/Roster</label>
        <select
          value={form.diagramaRoster}
          onChange={(e) => onChange('diagramaRoster', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {DIAGRAMA_ROSTER.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidad para pernocte en campamento</label>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pernocte"
              checked={form.pernocteCampamento === true}
              onChange={() => onChange('pernocteCampamento', true)}
              className="text-amber-600"
            />
            <span className="text-slate-700">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pernocte"
              checked={form.pernocteCampamento === false}
              onChange={() => onChange('pernocteCampamento', false)}
              className="text-amber-600"
            />
            <span className="text-slate-700">No</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Años de Experiencia en Minería</label>
        <select
          value={form.experienciaMineria}
          onChange={(e) => onChange('experienciaMineria', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {EXPERIENCIA_MINERIA.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
