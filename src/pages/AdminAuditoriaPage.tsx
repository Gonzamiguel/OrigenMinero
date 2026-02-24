import { BadgeCheck, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AdminAuditoriaPage() {
  const { perfilesAuditoria, aprobarSello, addToast } = useApp();

  const handleAprobar = (perfilId: string, tipo: 'local' | 'sustentable') => {
    aprobarSello(perfilId, tipo);
    addToast(
      tipo === 'local'
        ? 'Sello Local aprobado correctamente.'
        : 'Sello Sustentable otorgado correctamente.'
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Auditoría</h1>
        <p className="text-gray-600 mb-6">
          Bandeja de perfiles pendientes de validación (Sun Solutions)
        </p>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {perfilesAuditoria.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No hay perfiles pendientes de auditoría.
            </div>
          ) : (
            <div className="divide-y">
              {perfilesAuditoria.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                    {p.empresa && (
                      <p className="text-sm text-gray-600">{p.empresa}</p>
                    )}
                    <p className="text-sm text-gray-500">{p.localidad}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">
                      Pendiente: {p.tipoSello === 'local' ? 'Sello Local' : 'Sello Sustentable'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {p.tipoSello === 'local' ? (
                      <button
                        onClick={() => handleAprobar(p.id, 'local')}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 text-sm"
                      >
                        <BadgeCheck className="w-4 h-4" />
                        Aprobar Sello Local
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAprobar(p.id, 'sustentable')}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 text-sm"
                      >
                        <Leaf className="w-4 h-4" />
                        Otorgar Sello Sustentable
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
