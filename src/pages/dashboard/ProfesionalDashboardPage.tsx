import { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Clock, Zap, FileText, Check, X, Gavel, MapPin, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DOC_LABELS: Record<string, string> = {
  afip: 'Constancia AFIP',
  art: 'ART',
  seguro: 'Seguro',
  residencia: 'Constancia Residencia',
  cv: 'CV',
};

export function ProfesionalDashboardPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<'historial' | 'licitaciones'>(
    tabParam === 'licitaciones' ? 'licitaciones' : 'historial'
  );
  const { perfiles, licitaciones, historialDocumentos, postularLicitacion, addToast } = useApp();
  const perfilActual = perfiles.find((p) => p.tipo === 'profesional' && p.id === '3') || perfiles.find((p) => p.tipo === 'profesional') || perfiles[0];
  const historialFiltrado = historialDocumentos.filter((h) => h.perfilId === perfilActual?.id);

  useEffect(() => {
    setTab(tabParam === 'licitaciones' ? 'licitaciones' : 'historial');
  }, [tabParam]);

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const yaPostulado = (licId: string) =>
    perfilActual && licitaciones.find((l) => l.id === licId)?.postulantes.includes(perfilActual.id);

  if (!tabParam || tabParam === 'panel') {
    return <Navigate to="/dashboard/profesional/perfil" replace />;
  }

  const handlePostular = (licId: string) => {
    if (perfilActual) {
      postularLicitacion(licId, perfilActual.id);
      addToast('Postulación enviada correctamente.');
    }
  };

  if (tab === 'licitaciones') {
    return (
      <div className="py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Licitaciones</h1>
          <p className="text-slate-600 mb-6">
            Diario interno de oportunidades. Revisá cada licitación y postulate según tus necesidades.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              Plan Gratuito: mostramos licitaciones con 48hs de retraso. Mejorá a Premium para acceso en tiempo real.
            </span>
          </div>
          <div className="space-y-4">
            {licitaciones.map((l) => {
              const postulado = yaPostulado(l.id);
              return (
                <article
                  key={l.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-slate-800 text-lg">{l.titulo}</h2>
                      <p className="text-slate-600 mt-2 text-sm">{l.descripcion}</p>
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {l.localidad}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Cierre: {l.fechaCierre}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {postulado ? (
                        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium">
                          <Check className="w-4 h-4" />
                          Postulado
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePostular(l.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 text-sm font-medium"
                        >
                          <Gavel className="w-4 h-4" />
                          Postular
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <button
            onClick={() => addToast('Próximamente: plan Premium con postulaciones en 1-clic y alertas por WhatsApp. Contactá a ventas@origenminero.com', 'info')}
            className="mt-6 w-full py-3 px-4 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-4 h-4" />
            Mejorar a Premium para alertas en tiempo real
          </button>
        </div>
      </div>
    );
  }

  if (tab === 'historial') {
    return (
      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Historial de archivos cargados</h1>
          {historialFiltrado.length === 0 ? (
            <p className="text-slate-500 py-8">No hay archivos cargados aún.</p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-medium text-slate-700">Archivo</th>
                    <th className="text-left p-4 font-medium text-slate-700">Tipo</th>
                    <th className="text-left p-4 font-medium text-slate-700">Fecha carga</th>
                    <th className="text-left p-4 font-medium text-slate-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historialFiltrado.map((h) => (
                    <tr key={h.id} className="border-b border-slate-100">
                      <td className="p-4">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          {h.nombreArchivo}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{DOC_LABELS[h.tipoDocumento] || h.tipoDocumento}</td>
                      <td className="p-4 text-slate-600">{formatFecha(h.fechaCarga)}</td>
                      <td className="p-4">
                        {h.estado === 'en_revision' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3" />
                            En revisión
                          </span>
                        )}
                        {h.estado === 'aprobado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <Check className="w-3 h-3" />
                            Aprobado {h.fechaResolucion && `(${formatFecha(h.fechaResolucion)})`}
                          </span>
                        )}
                        {h.estado === 'rechazado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <X className="w-3 h-3" />
                            Rechazado {h.fechaResolucion && `(${formatFecha(h.fechaResolucion)})`}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <Navigate to="/dashboard/profesional/perfil" replace />;
}
