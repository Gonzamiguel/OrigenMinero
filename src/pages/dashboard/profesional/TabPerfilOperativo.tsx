import { DIAGRAMA_ROSTER, EXPERIENCIA_MINERIA, OFICIOS_EXTENDIDOS } from '../../../data/mockData';

export interface PerfilOperativoForm {
  oficio: string;
  experienciaMineria: string;
  diagramaRoster: string;
  pernocteCampamento: boolean | null;
}

interface TabPerfilOperativoProps {
  form: PerfilOperativoForm;
  onChange: (field: keyof PerfilOperativoForm, value: string | boolean | null) => void;
}

export function TabPerfilOperativo({ form, onChange }: TabPerfilOperativoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Oficio / Especialidad principal</label>
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Años de experiencia</label>
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Diagrama preferido</label>
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Disponibilidad para subir a campamento</label>
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
    </div>
  );
}
