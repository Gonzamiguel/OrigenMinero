import { RUBROS_B2B_EXTENDIDOS, TAMANO_EMPRESA } from '../../../data/mockData';

export interface CapacidadOperativaForm {
  rubroPrincipal: string;
  tamanoEmpresa: string;
  experienciaMineraPrevia: boolean | null;
  descripcionFlota: string;
}

interface TabCapacidadOperativaProps {
  form: CapacidadOperativaForm;
  onChange: (field: keyof CapacidadOperativaForm, value: string | boolean) => void;
}

export function TabCapacidadOperativa({ form, onChange }: TabCapacidadOperativaProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Rubro Principal</label>
        <select
          value={form.rubroPrincipal}
          onChange={(e) => onChange('rubroPrincipal', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {RUBROS_B2B_EXTENDIDOS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tamaño de Empresa / Empleados</label>
        <select
          value={form.tamanoEmpresa}
          onChange={(e) => onChange('tamanoEmpresa', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
        >
          <option value="">Seleccionar</option>
          {TAMANO_EMPRESA.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Experiencia Minera Previa</label>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="expMinera"
              checked={form.experienciaMineraPrevia === true}
              onChange={() => onChange('experienciaMineraPrevia', true)}
              className="text-amber-600"
            />
            <span className="text-slate-700">Sí</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="expMinera"
              checked={form.experienciaMineraPrevia === false}
              onChange={() => onChange('experienciaMineraPrevia', false)}
              className="text-amber-600"
            />
            <span className="text-slate-700">No</span>
          </label>
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de Flota/Equipamiento</label>
        <textarea
          value={form.descripcionFlota}
          onChange={(e) => onChange('descripcionFlota', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
          placeholder="Breve descripción de maquinaria, vehículos, equipos disponibles..."
        />
      </div>
    </div>
  );
}
