import { useState, useEffect, useRef } from 'react';
import { Leaf, Upload, Plus, X, Loader2, Award } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../context/AppContext';
import {
  getProveedorProfile,
  createOrUpdateProfile,
  uploadESGDocument,
  getDocumentsByUserId,
} from '../../../lib/firebase/db';
import type { TipoDocumentoESG, EstadoSelloVerde } from '../../../lib/firebase/types';

const DOCUMENTOS_ESG: { id: TipoDocumentoESG; label: string; opcional?: boolean }[] = [
  { id: 'politica_medio_ambiente', label: 'Política de Medio Ambiente' },
  { id: 'codigo_etica', label: 'Código de Ética y Conducta' },
  { id: 'reporte_sustentabilidad', label: 'Reporte de Sustentabilidad', opcional: true },
];

export interface ESGForm {
  pctEmpleadosLocales: number | null;
  energiasRenovables: boolean;
  energiasRenovablesDetalle: string;
  equidadGenero: boolean;
  equidadGeneroDetalle: string;
  proyectosRSE: { titulo: string; descripcion: string; inversionEstimada?: string }[];
}

const emptyForm: ESGForm = {
  pctEmpleadosLocales: null,
  energiasRenovables: false,
  energiasRenovablesDetalle: '',
  equidadGenero: false,
  equidadGeneroDetalle: '',
  proyectosRSE: [],
};

interface DocESG {
  id: string;
  tipoDocumento: TipoDocumentoESG;
  fileUrl: string;
  fileName: string;
  estado: string;
}

export function ProveedorESG() {
  const { user } = useAuth();
  const { addToast, refreshPerfiles } = useApp();
  const uid = user?.uid ?? '';
  const fileInputRefs = useRef<Record<TipoDocumentoESG, HTMLInputElement | null>>({
    politica_medio_ambiente: null,
    codigo_etica: null,
    reporte_sustentabilidad: null,
  });

  const [form, setForm] = useState<ESGForm>(emptyForm);
  const [estadoSello, setEstadoSello] = useState<EstadoSelloVerde>('incompleto');
  const [docsESG, setDocsESG] = useState<DocESG[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<TipoDocumentoESG | null>(null);
  const [modalProyecto, setModalProyecto] = useState(false);
  const [proyectoEditar, setProyectoEditar] = useState<{ titulo: string; descripcion: string; inversionEstimada?: string } | null>(null);
  const [proyectoIndex, setProyectoIndex] = useState<number | null>(null);

  const loadData = async () => {
    if (!uid) return;
    try {
      const [profile, allDocs] = await Promise.all([
        getProveedorProfile(uid),
        getDocumentsByUserId(uid),
      ]);
      const esg = (profile?.esg as Record<string, unknown>) ?? {};
      setForm({
        pctEmpleadosLocales: (esg.pctEmpleadosLocales as number) ?? null,
        energiasRenovables: (esg.energiasRenovables as boolean) ?? false,
        energiasRenovablesDetalle: (esg.energiasRenovablesDetalle as string) ?? '',
        equidadGenero: (esg.equidadGenero as boolean) ?? false,
        equidadGeneroDetalle: (esg.equidadGeneroDetalle as string) ?? '',
        proyectosRSE: (esg.proyectosRSE as ESGForm['proyectosRSE']) ?? [],
      });
      setEstadoSello((esg.estadoSello as EstadoSelloVerde) ?? 'incompleto');
      const esgDocs = allDocs.filter(
        (d) =>
          d.tipoDocumento &&
          ['politica_medio_ambiente', 'codigo_etica', 'reporte_sustentabilidad'].includes(
            d.tipoDocumento as string
          )
      ) as unknown as DocESG[];
      setDocsESG(esgDocs);
    } catch (err) {
      console.error(err);
      addToast('Error al cargar datos ESG.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid]);

  const bloqueACompleto =
    form.pctEmpleadosLocales !== null &&
    form.pctEmpleadosLocales >= 0 &&
    form.pctEmpleadosLocales <= 100;
  const bloqueBCompleto =
    docsESG.some((d) => d.tipoDocumento === 'politica_medio_ambiente') &&
    docsESG.some((d) => d.tipoDocumento === 'codigo_etica');
  const puedeSolicitarAuditoria = bloqueACompleto && bloqueBCompleto && estadoSello === 'incompleto';

  const handleGuardar = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      await createOrUpdateProfile(uid, 'proveedor', {
        esg: {
          pctEmpleadosLocales: form.pctEmpleadosLocales,
          energiasRenovables: form.energiasRenovables,
          energiasRenovablesDetalle: form.energiasRenovablesDetalle,
          equidadGenero: form.equidadGenero,
          equidadGeneroDetalle: form.equidadGeneroDetalle,
          proyectosRSE: form.proyectosRSE,
          estadoSello,
        },
      });
      await refreshPerfiles();
      addToast('Datos de impacto y RSE guardados correctamente.');
    } catch (err) {
      console.error(err);
      addToast('Error al guardar. Intentá nuevamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (tipo: TipoDocumentoESG, file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      addToast('Solo se permiten archivos PDF.', 'error');
      return;
    }
    setUploading(tipo);
    try {
      await uploadESGDocument(uid, file, tipo);
      addToast(`"${file.name}" cargado. Será revisado por el auditor.`, 'info');
      await loadData();
    } catch (err) {
      console.error(err);
      addToast('Error al subir el documento.', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleSolicitarAuditoria = async () => {
    if (!puedeSolicitarAuditoria) return;
    setSaving(true);
    try {
      await createOrUpdateProfile(uid, 'proveedor', {
        esg: {
          ...form,
          energiasRenovablesDetalle: form.energiasRenovablesDetalle,
          equidadGeneroDetalle: form.equidadGeneroDetalle,
          estadoSello: 'en_revision' as EstadoSelloVerde,
        },
      });
      setEstadoSello('en_revision');
      await refreshPerfiles();
      addToast('Solicitud de auditoría ESG enviada. Te contactaremos pronto.');
    } catch (err) {
      console.error(err);
      addToast('Error al solicitar auditoría.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const abrirModalProyecto = (index?: number) => {
    if (index !== undefined && index >= 0) {
      setProyectoEditar(form.proyectosRSE[index]);
      setProyectoIndex(index);
    } else {
      setProyectoEditar({ titulo: '', descripcion: '', inversionEstimada: '' });
      setProyectoIndex(null);
    }
    setModalProyecto(true);
  };

  const guardarProyecto = () => {
    if (!proyectoEditar) return;
    if (proyectoIndex !== null) {
      setForm((p) => ({
        ...p,
        proyectosRSE: p.proyectosRSE.map((pr, i) =>
          i === proyectoIndex ? proyectoEditar : pr
        ),
      }));
    } else {
      setForm((p) => ({
        ...p,
        proyectosRSE: [...p.proyectosRSE, proyectoEditar],
      }));
    }
    setModalProyecto(false);
    setProyectoEditar(null);
    setProyectoIndex(null);
  };

  const eliminarProyecto = (index: number) => {
    setForm((p) => ({
      ...p,
      proyectosRSE: p.proyectosRSE.filter((_, i) => i !== index),
    }));
  };

  const getDocByTipo = (tipo: TipoDocumentoESG) =>
    docsESG.find((d) => d.tipoDocumento === tipo);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Sello Verde */}
      <div
        className={`rounded-xl border p-6 ${
          estadoSello === 'sello_otorgado'
            ? 'bg-emerald-50 border-emerald-200'
            : estadoSello === 'en_revision'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-start gap-4">
          {estadoSello === 'sello_otorgado' ? (
            <Award className="w-10 h-10 text-emerald-600 shrink-0" />
          ) : (
            <Leaf className={`w-10 h-10 shrink-0 ${estadoSello === 'en_revision' ? 'text-amber-600' : 'text-slate-500'}`} />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Sello Verde Minero</h3>
            {estadoSello === 'sello_otorgado' && (
              <p className="text-emerald-800">
                ¡Felicidades! Eres un proveedor de Impacto Positivo verificado.
              </p>
            )}
            {estadoSello === 'en_revision' && (
              <p className="text-amber-800">
                Tus datos están siendo auditados por Origen Minero.
              </p>
            )}
            {estadoSello === 'incompleto' && (
              <p className="text-slate-600">
                Completa tus métricas y políticas para solicitar el Sello Verde.
              </p>
            )}
            {puedeSolicitarAuditoria && (
              <button
                onClick={handleSolicitarAuditoria}
                disabled={saving}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition disabled:opacity-60"
              >
                {saving ? 'Enviando...' : 'Solicitar Auditoría ESG'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bloque A: Métricas de Impacto */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">Métricas de Impacto Local</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              % de empleados de comunidades locales (Jáchal, Iglesia, etc.)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.pctEmpleadosLocales ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                setForm((p) => ({ ...p, pctEmpleadosLocales: v }));
              }}
              className="w-full max-w-xs px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
              placeholder="Ej: 45"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.energiasRenovables}
                onChange={(e) => setForm((p) => ({ ...p, energiasRenovables: e.target.checked }))}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700">¿Cuenta con instalación de energías renovables?</span>
            </label>
            {form.energiasRenovables && (
              <div className="mt-2 ml-6">
                <textarea
                  value={form.energiasRenovablesDetalle}
                  onChange={(e) => setForm((p) => ({ ...p, energiasRenovablesDetalle: e.target.value }))}
                  placeholder="Brinda más detalles sobre esta iniciativa (opcional)"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none resize-none text-sm"
                />
              </div>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.equidadGenero}
                onChange={(e) => setForm((p) => ({ ...p, equidadGenero: e.target.checked }))}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700">¿Cuenta con programa de equidad de género?</span>
            </label>
            {form.equidadGenero && (
              <div className="mt-2 ml-6">
                <textarea
                  value={form.equidadGeneroDetalle}
                  onChange={(e) => setForm((p) => ({ ...p, equidadGeneroDetalle: e.target.value }))}
                  placeholder="Brinda más detalles sobre esta iniciativa (opcional)"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none resize-none text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bloque B: Políticas Corporativas */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">Políticas Corporativas</h4>
        <div className="space-y-4">
          {DOCUMENTOS_ESG.map((doc) => {
            const uploaded = getDocByTipo(doc.id);
            const isUploading = uploading === doc.id;
            return (
              <div key={doc.id} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{doc.label}</p>
                  {doc.opcional && (
                    <span className="text-xs text-slate-500">(Opcional)</span>
                  )}
                  {uploaded && (
                    <p className="text-sm text-slate-600 mt-1">
                      {uploaded.fileName} —{' '}
                      <span className="text-amber-600">{uploaded.estado}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[doc.id] = el;
                    }}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(doc.id, f);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition disabled:opacity-60"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploaded ? 'Reemplazar' : 'Cargar PDF'}
                  </button>
                  {uploaded?.fileUrl && (
                    <a
                      href={uploaded.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-amber-600 hover:underline"
                    >
                      Ver
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bloque C: Proyectos RSE */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">Proyectos Declarados</h4>
        <button
          onClick={() => abrirModalProyecto()}
          className="inline-flex items-center gap-2 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition mb-4"
        >
          <Plus className="w-4 h-4" />
          Añadir Proyecto RSE
        </button>
        <div className="space-y-3">
          {form.proyectosRSE.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay proyectos declarados.</p>
          ) : (
            form.proyectosRSE.map((p, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 rounded-lg flex justify-between items-start gap-4"
              >
                <div>
                  <p className="font-medium text-slate-800">{p.titulo}</p>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{p.descripcion}</p>
                  {p.inversionEstimada && (
                    <p className="text-xs text-slate-500 mt-1">Inversión: {p.inversionEstimada}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => abrirModalProyecto(i)}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarProyecto(i)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Proyecto */}
      {modalProyecto && proyectoEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-slate-800">
                {proyectoIndex !== null ? 'Editar Proyecto RSE' : 'Nuevo Proyecto RSE'}
              </h4>
              <button
                onClick={() => {
                  setModalProyecto(false);
                  setProyectoEditar(null);
                  setProyectoIndex(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del proyecto</label>
                <input
                  value={proyectoEditar.titulo}
                  onChange={(e) =>
                    setProyectoEditar((p) => (p ? { ...p, titulo: e.target.value } : p))
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                  placeholder="Ej: Capacitación en seguridad vial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del impacto</label>
                <textarea
                  value={proyectoEditar.descripcion}
                  onChange={(e) =>
                    setProyectoEditar((p) => (p ? { ...p, descripcion: e.target.value } : p))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none resize-none"
                  placeholder="Breve descripción del impacto social o ambiental..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Inversión estimada (opcional)
                </label>
                <input
                  value={proyectoEditar.inversionEstimada ?? ''}
                  onChange={(e) =>
                    setProyectoEditar((p) =>
                      p ? { ...p, inversionEstimada: e.target.value } : p
                    )
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                  placeholder="Ej: $500.000"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalProyecto(false);
                  setProyectoEditar(null);
                  setProyectoIndex(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarProyecto}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón Guardar */}
      <div className="pt-4">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
