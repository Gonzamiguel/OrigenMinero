import { useState, useEffect } from 'react';
import { FileText, Loader2, Search } from 'lucide-react';
import { getPendingDocumentsForAuditor, updateDocumentStatus, type DocumentoPendienteAuditor } from '../../../lib/firebase/documentService';
import { useApp } from '../../../context/AppContext';

function formatDate(ts: { toMillis: () => number } | null): string {
  if (!ts) return '-';
  return new Date(ts.toMillis()).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface AuditPanelProps {
  doc: DocumentoPendienteAuditor;
  onClose: () => void;
  onSuccess: () => void;
}

function AuditPanel({ doc, onClose, onSuccess }: AuditPanelProps) {
  const { addToast } = useApp();
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [feedbackAuditor, setFeedbackAuditor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAprobar = async () => {
    if (!fechaVencimiento) return;
    setLoading(true);
    try {
      await updateDocumentStatus(doc.id, {
        estado: 'aprobado',
        fechaVencimiento: new Date(fechaVencimiento),
      });
      addToast('Documento aprobado correctamente.');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Error al aprobar el documento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!feedbackAuditor.trim()) return;
    setLoading(true);
    try {
      await updateDocumentStatus(doc.id, {
        estado: 'rechazado',
        feedbackAuditor: feedbackAuditor.trim(),
      });
      addToast('Documento rechazado.');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Error al rechazar el documento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">
        Revisión de {doc.tipoDocumento}
      </h2>
      <p className="text-sm text-slate-600 mb-6">
        Subido por <strong>{doc.ownerName}</strong>
      </p>

      {mode === 'idle' && (
        <div className="space-y-4">
          <button
            onClick={() => setMode('approve')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-semibold transition"
          >
            APROBAR
          </button>
          <button
            onClick={() => setMode('reject')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 font-semibold transition"
          >
            RECHAZAR
          </button>
        </div>
      )}

      {mode === 'approve' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fecha de vencimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAprobar}
              disabled={!fechaVencimiento || loading}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar aprobación
            </button>
            <button
              onClick={() => setMode('idle')}
              disabled={loading}
              className="px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mode === 'reject' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Motivo del rechazo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedbackAuditor}
              onChange={(e) => setFeedbackAuditor(e.target.value)}
              placeholder="Indicá el motivo por el cual se rechaza el documento..."
              rows={4}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRechazar}
              disabled={!feedbackAuditor.trim() || loading}
              className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar rechazo
            </button>
            <button
              onClick={() => setMode('idle')}
              disabled={loading}
              className="px-4 py-3 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AuditorPendientesPage() {
  const [docs, setDocs] = useState<DocumentoPendienteAuditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoPendienteAuditor | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getPendingDocumentsForAuditor();
      setDocs(list);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los documentos. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (selectedDoc) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h1 className="text-xl font-bold text-slate-800">
            Revisión: {selectedDoc.tipoDocumento} — {selectedDoc.ownerName}
          </h1>
          <button
            onClick={() => setSelectedDoc(null)}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            Volver a la bandeja
          </button>
        </div>
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 bg-slate-100 p-4">
            <iframe
              src={selectedDoc.fileUrl}
              title={selectedDoc.nombreOriginal}
              className="w-full h-full rounded-lg border border-slate-200 bg-white"
            />
          </div>
          <div className="w-[380px] flex-shrink-0 p-6 border-l border-slate-200 bg-white overflow-auto">
            <AuditPanel
              doc={selectedDoc}
              onClose={() => setSelectedDoc(null)}
              onSuccess={load}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Bandeja de Entrada</h1>
        <p className="text-slate-600 mb-8">
          Documentos pendientes de revisión. Hacé clic en &quot;Auditar&quot; para revisar cada uno.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-600">
              <p className="font-medium">{error}</p>
              <button
                onClick={load}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium"
              >
                Reintentar
              </button>
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText className="w-14 h-14 mb-4 opacity-50" />
              <p className="font-medium">No hay documentos pendientes</p>
              <p className="text-sm mt-1">La bandeja está vacía.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 truncate">{doc.ownerName}</p>
                    <p className="text-sm text-slate-500">
                      {doc.tipoDocumento} · {formatDate(doc.fechaSubida)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition flex-shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    Auditar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
