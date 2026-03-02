import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDocuments, type DocumentoCompliance } from '../../lib/firebase/documentService';

function formatDate(ts: { toMillis: () => number } | null): string {
  if (!ts) return '-';
  const date = new Date(ts.toMillis());
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function EstadoBadge({ estado, feedback }: { estado: string; feedback: string }) {
  const styles = {
    pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
    aprobado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rechazado: 'bg-red-100 text-red-800 border-red-200',
  };
  const labels = {
    pendiente: 'Esperando auditoría',
    aprobado: 'Validado',
    rechazado: 'Rechazado',
  };
  const style = styles[estado as keyof typeof styles] ?? styles.pendiente;
  const label = labels[estado as keyof typeof labels] ?? estado;

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {label}
      </span>
      {estado === 'rechazado' && feedback && (
        <span className="text-xs text-red-600">{feedback}</span>
      )}
    </div>
  );
}

export function HistorialPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentoCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.uid ?? '';

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const docs = await getUserDocuments(userId);
        if (!cancelled) setDocuments(docs);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Error al cargar los documentos.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Historial de archivos</h1>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay documentos cargados.</p>
              <p className="text-sm mt-1">Subí documentos desde la sección Documentos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{doc.nombreOriginal}</p>
                    <p className="text-sm text-slate-500">{doc.tipoDocumento} · {formatDate(doc.fechaSubida)}</p>
                  </div>
                  <EstadoBadge estado={doc.estado} feedback={doc.feedbackAuditor} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
