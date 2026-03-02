import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { getCompletedDocumentsForAuditor, type DocumentoPendienteAuditor } from '../../../lib/firebase/documentService';

function formatDate(ts: { toMillis: () => number } | null): string {
  if (!ts) return '-';
  return new Date(ts.toMillis()).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function EstadoBadge({ estado }: { estado: string }) {
  const isAprobado = estado === 'aprobado';
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isAprobado ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isAprobado ? 'Aprobado' : 'Rechazado'}
    </span>
  );
}

export function AuditorCompletadasPage() {
  const [docs, setDocs] = useState<DocumentoPendienteAuditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const list = await getCompletedDocumentsForAuditor();
        if (!cancelled) setDocs(list);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Auditorías Completadas</h1>
        <p className="text-slate-600 mb-8">
          Historial de documentos aprobados o rechazados.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="w-14 h-14 mb-4 opacity-50" />
              <p className="font-medium">No hay auditorías completadas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left p-4 font-medium text-slate-700">Emisor</th>
                    <th className="text-left p-4 font-medium text-slate-700">Tipo</th>
                    <th className="text-left p-4 font-medium text-slate-700">Fecha</th>
                    <th className="text-left p-4 font-medium text-slate-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{doc.ownerName}</td>
                      <td className="p-4 text-slate-600">{doc.tipoDocumento}</td>
                      <td className="p-4 text-slate-600">{formatDate(doc.fechaSubida)}</td>
                      <td className="p-4">
                        <EstadoBadge estado={doc.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
