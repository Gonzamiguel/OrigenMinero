import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, ExternalLink, Ban } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  getApprovedDocumentsWithExpiry,
  updateDocumentEstado,
  type DocumentoConVencimiento,
} from '../../../lib/firebase/auditorService';

function formatDate(ts: { toMillis: () => number } | null): string {
  if (!ts) return '-';
  return new Date(ts.toMillis()).toLocaleDateString('es-AR');
}

export function AuditorVencimientosPage() {
  const { addToast } = useApp();
  const [docs, setDocs] = useState<DocumentoConVencimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApprovedDocumentsWithExpiry();
      setDocs(data);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar los vencimientos.');
      addToast('Error al cargar vencimientos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const now = Date.now();
  const next30 = now + 30 * 24 * 60 * 60 * 1000;

  const { proximos, vencidos } = useMemo(() => {
    const proximos: DocumentoConVencimiento[] = [];
    const vencidos: DocumentoConVencimiento[] = [];
    docs.forEach((d) => {
      const ts = d.fechaVencimiento?.toMillis?.() ?? 0;
      if (!ts) return;
      if (ts < now) {
        vencidos.push(d);
      } else if (ts <= next30) {
        proximos.push(d);
      }
    });
    const sortByDate = (arr: DocumentoConVencimiento[]) =>
      arr.sort((a, b) => (a.fechaVencimiento?.toMillis?.() ?? 0) - (b.fechaVencimiento?.toMillis?.() ?? 0));
    return { proximos: sortByDate(proximos), vencidos: sortByDate(vencidos) };
  }, [docs, now, next30]);

  const handleRevocar = async (docId: string) => {
    try {
      await updateDocumentEstado(docId, 'vencido');
      addToast('Estado actualizado a vencido.');
      load();
    } catch (err) {
      console.error(err);
      addToast('No se pudo revocar la aprobación.', 'error');
    }
  };

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Radar de Vencimientos
            </h1>
            <p className="text-slate-600 mt-1">Prevención de caídas de habilitaciones.</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-xl p-8 text-red-700">
            <p className="font-semibold">{error}</p>
            <button
              onClick={load}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <Section
              title="Próximos a vencer (30 días)"
              color="amber"
              items={proximos}
              onRevocar={handleRevocar}
            />
            <Section
              title="Vencidos"
              color="red"
              items={vencidos}
              onRevocar={handleRevocar}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  color: 'amber' | 'red';
  items: DocumentoConVencimiento[];
  onRevocar: (id: string) => void;
}

function Section({ title, color, items, onRevocar }: SectionProps) {
  const badgeColor = color === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';
  const borderColor = color === 'amber' ? 'border-amber-200' : 'border-red-200';

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
            {items.length}
          </span>
          {title}
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="px-6 py-10 text-slate-500">Sin documentos en esta categoría.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-4 font-semibold text-slate-700">Usuario</th>
                <th className="text-left p-4 font-semibold text-slate-700">Documento</th>
                <th className="text-left p-4 font-semibold text-slate-700">Vence</th>
                <th className="text-left p-4 font-semibold text-slate-700">Última act.</th>
                <th className="text-left p-4 font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-800">{d.userId || '-'}</td>
                  <td className="p-4 text-slate-700 capitalize">{d.tipoDocumento || 'Documento'}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${borderColor}`}>
                      {formatDate(d.fechaVencimiento)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{formatDate(d.updatedAt || d.fechaSubida)}</td>
                  <td className="p-4 text-right space-x-2">
                    {d.fileUrl && (
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver
                      </a>
                    )}
                    <button
                      onClick={() => onRevocar(d.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500"
                    >
                      <Ban className="w-4 h-4" />
                      Revocar aprobación
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
