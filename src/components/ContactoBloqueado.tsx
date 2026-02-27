import { Lock } from 'lucide-react';

export function ContactoBloqueado() {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
      <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 font-medium">
        Iniciá sesión como Empresa para ver el legajo completo y contactar
      </p>
    </div>
  );
}
