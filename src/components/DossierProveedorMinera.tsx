import { Link } from 'react-router-dom';
import { X, MapPin, BadgeCheck, Leaf, Download, Phone, ArrowLeft, Building2, Briefcase, Award } from 'lucide-react';
import { getDossierProveedor } from '../data/proveedorDossier';
import { descargarLegajo } from '../utils/descargarLegajo';
import type { Perfil } from '../types';
import type { HistorialDocumento } from '../types';

interface DossierProveedorMineraProps {
  perfil: Perfil;
  historialFiltrado: HistorialDocumento[];
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  variant?: 'modal' | 'inline';
  onClose?: () => void;
  onDescargar?: () => void;
}

const ESTADO_BADGE = {
  ok: { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  en_revision: { label: 'Revisión', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  vencido: { label: 'Vencido', className: 'bg-red-100 text-red-700 border-red-200' },
  pendiente: { label: 'Pendiente', className: 'bg-slate-100 text-slate-600 border-slate-200' },
} as const;

export function DossierProveedorMinera({
  perfil,
  historialFiltrado,
  addToast,
  variant = 'modal',
  onClose,
  onDescargar,
}: DossierProveedorMineraProps) {
  const dossier = getDossierProveedor(perfil.id, perfil.semaforo);
  const docsOk = Object.values(perfil.semaforo).filter(Boolean).every((e) => e === 'ok');
  const isModal = variant === 'modal';

  const handleDescargar = async () => {
    addToast(`Descargando legajo de ${perfil.empresa || perfil.nombre}...`, 'info');
    try {
      await descargarLegajo(perfil, historialFiltrado);
      addToast('Legajo descargado correctamente.');
      onDescargar?.();
    } catch {
      addToast('Error al descargar el legajo.', 'error');
    }
  };

  const content = (
    <div
      className={`bg-slate-50 rounded-2xl shadow-xl border border-slate-200 w-full max-w-5xl overflow-hidden ${
        isModal ? 'my-8' : ''
      }`}
    >
      {/* Header */}
      <div className="relative bg-white border-b border-slate-200 p-6">
        {isModal && onClose ? (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <Link
            to="/proveedores"
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a proveedores
          </Link>
        )}

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Building2 className="w-12 h-12 sm:w-14 sm:h-14 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-800">{perfil.empresa || perfil.nombre}</h1>
            {dossier.cuit && (
              <p className="text-slate-600 text-sm mt-0.5">CUIT: {dossier.cuit}</p>
            )}
            <p className="text-slate-600 font-medium mt-0.5">{perfil.rubro}</p>
            <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {perfil.localidad}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {perfil.selloValidado && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
                  <BadgeCheck className="w-4 h-4" />
                  Empresa Validada
                </span>
              )}
              {perfil.selloSustentable && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
                  <Leaf className="w-4 h-4" />
                  Proveedor Local
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Layout dos columnas */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Snapshot Operativo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide">
              Snapshot Operativo
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span><strong>Tamaño:</strong> {dossier.tamanoEmpresa}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Briefcase className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Experiencia:</strong>{' '}
                  {dossier.experienciaMinera ? 'Con experiencia minera' : 'Sin experiencia minera'}
                </span>
              </li>
              {dossier.certificaciones.length > 0 && (
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Certificaciones:</strong> {dossier.certificaciones.join(', ')}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDescargar}
              disabled={!docsOk}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm transition ${
                docsOk
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-5 h-5" />
              Descargar Legajo Legal (.ZIP)
            </button>
            {!docsOk && (
              <p className="text-xs text-amber-700 px-2">
                Documentos pendientes de validación por el auditor.
              </p>
            )}
            <a
              href={perfil.telefono ? `tel:${perfil.telefono}` : (perfil.email ? `mailto:${perfil.email}` : '#')}
              className={`flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-medium text-sm border transition ${
                perfil.telefono || perfil.email
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
              }`}
            >
              <Phone className="w-5 h-5" />
              Ver Datos de Contacto
            </a>
          </div>
        </div>

        {/* Columna derecha: Semáforo Legal Corporativo */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide">
              Estado de Documentación de Compliance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 font-medium text-slate-600">Documento</th>
                    <th className="text-left py-3 font-medium text-slate-600">Estado</th>
                    <th className="text-left py-3 font-medium text-slate-600">Fecha de Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.documentosLegales.map((doc) => {
                    const badge = ESTADO_BADGE[doc.estado];
                    const vencido = doc.estado === 'vencido';
                    return (
                      <tr key={doc.id} className="border-b border-slate-100">
                        <td className="py-3 text-slate-700">{doc.nombre}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${badge.className}`}
                          >
                            {doc.estado === 'ok' && '✅'}
                            {doc.estado === 'en_revision' && '⏳'}
                            {(doc.estado === 'vencido' || doc.estado === 'pendiente') && '❌'}
                            {badge.label}
                          </span>
                        </td>
                        <td className={`py-3 font-medium ${vencido ? 'text-red-600' : 'text-slate-600'}`}>
                          Vence: {doc.vencimiento}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-start justify-center p-4 lg:p-8"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">{content}</div>
    </div>
  );
}

