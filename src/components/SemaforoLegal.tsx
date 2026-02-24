import { Circle } from 'lucide-react';
import type { Perfil } from '../types';

interface SemaforoLegalProps {
  semaforo: Perfil['semaforo'];
  compact?: boolean;
}

const labels: Record<string, string> = {
  afip: 'AFIP',
  art: 'ART',
  seguro: 'Seguro',
  residencia: 'Residencia',
};

const colors = {
  ok: 'text-amber-600',
  pendiente: 'text-amber-500',
  vencido: 'text-red-600',
  en_revision: 'text-blue-600',
};

export function SemaforoLegal({ semaforo, compact }: SemaforoLegalProps) {
  const entries = Object.entries(semaforo).filter(([, v]) => v);

  return (
    <div className={compact ? 'flex gap-1' : 'space-y-2'}>
      {entries.map(([key, estado]) => (
        <div
          key={key}
          className={`flex items-center gap-2 ${compact ? '' : 'flex-row'}`}
          title={`${labels[key] || key}: ${estado}`}
        >
          <Circle
            className={`w-4 h-4 fill-current ${colors[estado]}`}
          />
          {!compact && (
            <span className="text-sm text-gray-600">
              {labels[key] || key}: {estado.replace('_', ' ')}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
