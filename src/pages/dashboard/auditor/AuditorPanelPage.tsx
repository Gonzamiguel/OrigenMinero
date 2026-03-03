import { useEffect, useState } from 'react';
import { Loader2, LayoutDashboard, FileCheck, CheckCircle2, Building2 } from 'lucide-react';
import { getDashboardMetrics, type AuditorMetrics } from '../../../lib/firebase/auditorService';
import { useApp } from '../../../context/AppContext';

export function AuditorPanelPage() {
  const { addToast } = useApp();
  const [metrics, setMetrics] = useState<AuditorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar las métricas. Reintenta.');
      addToast('Error al cargar el panel.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalHist = (metrics?.approvedCount ?? 0) + (metrics?.rejectedCount ?? 0);
  const approvedPct = totalHist > 0 ? Math.round(((metrics?.approvedCount ?? 0) / totalHist) * 100) : 0;
  const rejectedPct = totalHist > 0 ? 100 - approvedPct : 0;

  return (
    <div className="py-8 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-slate-700" />
              Panel de Control
            </h1>
            <p className="text-slate-600 mt-1">Resumen ejecutivo de cumplimiento.</p>
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
        ) : metrics ? (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Documentos pendientes"
                value={metrics.pendingDocuments}
                icon={FileCheck}
                accent="bg-amber-100 text-amber-700"
              />
              <KpiCard
                title="Auditados últimos 7 días"
                value={metrics.auditedLast7Days}
                icon={CheckCircle2}
                accent="bg-emerald-100 text-emerald-700"
              />
              <KpiCard
                title="Empresas registradas"
                value={metrics.totalProveedores}
                icon={Building2}
                accent="bg-blue-100 text-blue-700"
              />
              <KpiCard
                title="Total auditados (histórico)"
                value={totalHist}
                icon={LayoutDashboard}
                accent="bg-slate-100 text-slate-700"
              />
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Aprobados vs Rechazados
                </h2>
                <span className="text-sm text-slate-500">
                  {metrics.approvedCount} aprobados / {metrics.rejectedCount} rechazados
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${approvedPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Aprobados: {approvedPct}%
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  Rechazados: {rejectedPct}%
                </span>
              </div>
              {totalHist === 0 && (
                <p className="text-sm text-slate-500">
                  Aún no hay documentos auditados. Comienza en la bandeja de entrada.
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

function KpiCard({ title, value, icon: Icon, accent }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-600">{title}</p>
      </div>
    </div>
  );
}
