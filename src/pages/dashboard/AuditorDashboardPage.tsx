import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Check, X, BadgeCheck, Leaf, Upload, Users, FileCheck } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useApp } from '../../context/AppContext';
import type { DocumentoAuditoria } from '../../types';

const DOC_LABELS: Record<string, string> = {
  afip: 'Constancia AFIP',
  art: 'ART',
  seguro: 'Seguro',
  residencia: 'Constancia Residencia',
};

export function AuditorDashboardPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState<'inicio' | 'documentos' | 'sellos'>(
    tabParam === 'documentos' ? 'documentos' : tabParam === 'sellos' ? 'sellos' : 'inicio'
  );
  const {
    perfilesAuditoria,
    documentosPendientesAuditoria,
    perfiles,
    aprobarSello,
    aprobarDocumento,
    rechazarDocumento,
    addToast,
  } = useApp();
  const [docSelloSeleccionado, setDocSelloSeleccionado] = useState<typeof perfilesAuditoria[0] | null>(null);
  const [docCargadoSeleccionado, setDocCargadoSeleccionado] = useState<DocumentoAuditoria | null>(null);
  const [sellos, setSellos] = useState<Record<string, { local: boolean; sustentable: boolean }>>({});

  useEffect(() => {
    setTab(tabParam === 'documentos' ? 'documentos' : tabParam === 'sellos' ? 'sellos' : 'inicio');
  }, [tabParam]);

  const kpis = {
    sellosLocales: perfiles.filter((p) => p.selloValidado).length,
    sellosMedioambiente: perfiles.filter((p) => p.selloSustentable).length,
    totalProveedores: perfiles.filter((p) => p.tipo === 'proveedor').length,
    totalProfesionales: perfiles.filter((p) => p.tipo === 'profesional').length,
    documentosPendientes: documentosPendientesAuditoria.length,
    sellosPendientes: perfilesAuditoria.length,
  };

  const handleAprobarSello = (perfilId: string) => {
    const doc = perfilesAuditoria.find((p) => p.id === perfilId);
    if (doc) {
      aprobarSello(perfilId, doc.tipoSello);
      setDocSelloSeleccionado(null);
      addToast('Sello aprobado correctamente.');
    }
  };

  const handleRechazarSello = (_perfilId: string) => {
    setDocSelloSeleccionado(null);
    addToast('Sello rechazado.', 'error');
  };

  const handleAprobarDocumento = (docId: string) => {
    aprobarDocumento(docId);
    setDocCargadoSeleccionado(null);
  };

  const handleRechazarDocumento = (docId: string) => {
    rechazarDocumento(docId);
    setDocCargadoSeleccionado(null);
  };

  const toggleSello = (perfilId: string, tipo: 'local' | 'sustentable') => {
    setSellos((prev) => ({
      ...prev,
      [perfilId]: {
        ...prev[perfilId],
        [tipo]: !prev[perfilId]?.[tipo],
      },
    }));
    addToast(`Sello ${tipo === 'local' ? 'Local' : 'Sustentable'} actualizado.`);
  };

  const perfilesConSellos = perfiles.slice(0, 8);

  if (tab === 'inicio') {
    return (
      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-slate-800">Panel de Auditoría</h1>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpis.sellosLocales}</p>
                <p className="text-sm text-slate-600">Sellos locales actuales</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpis.sellosMedioambiente}</p>
                <p className="text-sm text-slate-600">Sellos de medioambiente</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpis.totalProveedores}</p>
                <p className="text-sm text-slate-600">Total proveedores</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpis.totalProfesionales}</p>
                <p className="text-sm text-slate-600">Total profesionales</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpis.documentosPendientes}</p>
                <p className="text-sm text-slate-600">Documentos pendientes</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpis.sellosPendientes}</p>
                <p className="text-sm text-slate-600">Sellos pendientes</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (tab === 'documentos') {
    return (
      <>
        <div className="py-8 px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-800">Aprobar documentos</h1>
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-slate-600" />
                Documentos cargados (AFIP, ART, Seguro, Residencia)
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                Los proveedores y profesionales cargan estos documentos. Validá su legitimidad y aprobá o rechazá.
              </p>
              <div className="space-y-2">
                {documentosPendientesAuditoria.length === 0 ? (
                  <p className="text-slate-500 py-4">No hay documentos cargados pendientes de revisión.</p>
                ) : (
                  documentosPendientesAuditoria.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setDocCargadoSeleccionado(doc)}
                      className="flex justify-between items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{doc.nombrePerfil} {doc.empresa && `• ${doc.empresa}`}</p>
                        <p className="text-sm text-slate-500">{doc.localidad} • {DOC_LABELS[doc.tipoDocumento] || doc.tipoDocumento}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        En revisión
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
        <Modal
        isOpen={!!docCargadoSeleccionado}
        onClose={() => setDocCargadoSeleccionado(null)}
        title={docCargadoSeleccionado ? `${docCargadoSeleccionado.nombrePerfil} - ${DOC_LABELS[docCargadoSeleccionado.tipoDocumento]}` : ''}
      >
        {docCargadoSeleccionado && (
          <div className="space-y-6">
            <p className="text-slate-600">
              Documento <strong>{DOC_LABELS[docCargadoSeleccionado.tipoDocumento]}</strong> cargado por {docCargadoSeleccionado.nombrePerfil}.
              Validá su legitimidad.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleAprobarDocumento(docCargadoSeleccionado.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium"
              >
                <Check className="w-5 h-5" />
                Aprobar (visible para mineras)
              </button>
              <button
                onClick={() => handleRechazarDocumento(docCargadoSeleccionado.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium"
              >
                <X className="w-5 h-5" />
                Rechazar
              </button>
            </div>
          </div>
        )}
      </Modal>

        <Modal
          isOpen={!!docSelloSeleccionado}
          onClose={() => setDocSelloSeleccionado(null)}
          title={docSelloSeleccionado ? `${docSelloSeleccionado.nombre} - Sello ${docSelloSeleccionado.tipoSello}` : ''}
        >
          {docSelloSeleccionado && (
            <div className="space-y-6">
              <p className="text-slate-600">
                Solicitud de sello <strong>{docSelloSeleccionado.tipoSello}</strong>.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleAprobarSello(docSelloSeleccionado.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium"
                >
                  <Check className="w-5 h-5" />
                  Aprobar
                </button>
                <button
                  onClick={() => handleRechazarSello(docSelloSeleccionado.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium"
                >
                  <X className="w-5 h-5" />
                  Rechazar
                </button>
              </div>
            </div>
          )}
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-slate-800">Aprobar sellos</h1>
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Sellos pendientes de otorgar
            </h2>
            <div className="space-y-2">
              {perfilesAuditoria.length === 0 ? (
                <p className="text-slate-500 py-4">No hay sellos pendientes.</p>
              ) : (
                perfilesAuditoria.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setDocSelloSeleccionado(doc)}
                    className="flex justify-between items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{doc.nombre} {doc.empresa && `• ${doc.empresa}`}</p>
                      <p className="text-sm text-slate-500">{doc.localidad} • Sello {doc.tipoSello}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      Pendiente
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Otorgar sellos manualmente</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 font-medium text-slate-700">Empresa / Profesional</th>
                    <th className="text-left p-3 font-medium text-slate-700">Sello Sustentable</th>
                    <th className="text-left p-3 font-medium text-slate-700">Sello Local</th>
                  </tr>
                </thead>
                <tbody>
                  {perfilesConSellos.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="p-3">
                        <p className="font-medium text-slate-800">{p.empresa || p.nombre}</p>
                        <p className="text-xs text-slate-500">{p.localidad}</p>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleSello(p.id, 'sustentable')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            sellos[p.id]?.sustentable || p.selloSustentable
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <Leaf className="w-4 h-4" />
                          {sellos[p.id]?.sustentable || p.selloSustentable ? 'Activado' : 'Desactivado'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleSello(p.id, 'local')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            sellos[p.id]?.local || p.selloValidado
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <BadgeCheck className="w-4 h-4" />
                          {sellos[p.id]?.local || p.selloValidado ? 'Activado' : 'Desactivado'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
      <Modal
        isOpen={!!docCargadoSeleccionado}
        onClose={() => setDocCargadoSeleccionado(null)}
        title={docCargadoSeleccionado ? `${docCargadoSeleccionado.nombrePerfil} - ${DOC_LABELS[docCargadoSeleccionado.tipoDocumento]}` : ''}
      >
        {docCargadoSeleccionado && (
          <div className="space-y-6">
            <p className="text-slate-600">
              Documento <strong>{DOC_LABELS[docCargadoSeleccionado.tipoDocumento]}</strong> cargado por {docCargadoSeleccionado.nombrePerfil}.
              Validá su legitimidad.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleAprobarDocumento(docCargadoSeleccionado.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium"
              >
                <Check className="w-5 h-5" />
                Aprobar (visible para mineras)
              </button>
              <button
                onClick={() => handleRechazarDocumento(docCargadoSeleccionado.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium"
              >
                <X className="w-5 h-5" />
                Rechazar
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={!!docSelloSeleccionado}
        onClose={() => setDocSelloSeleccionado(null)}
        title={docSelloSeleccionado ? `${docSelloSeleccionado.nombre} - Sello ${docSelloSeleccionado.tipoSello}` : ''}
      >
        {docSelloSeleccionado && (
          <div className="space-y-6">
            <p className="text-slate-600">
              Solicitud de sello <strong>{docSelloSeleccionado.tipoSello}</strong>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleAprobarSello(docSelloSeleccionado.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium"
              >
                <Check className="w-5 h-5" />
                Aprobar
              </button>
              <button
                onClick={() => handleRechazarSello(docSelloSeleccionado.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium"
              >
                <X className="w-5 h-5" />
                Rechazar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
