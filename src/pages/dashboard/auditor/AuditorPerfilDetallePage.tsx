import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Shield, Leaf, Award, XCircle, CheckCircle } from 'lucide-react';
import {
  getUserById,
  getProfileDetail,
  getDocumentsByUser,
  type UserBasic,
} from '../../../lib/firebase/auditorService';
import { updateProveedorESGSello } from '../../../lib/firebase/db';
import { useApp } from '../../../context/AppContext';
import type { EstadoSelloVerde } from '../../../lib/firebase/types';

type ProfileData = Record<string, unknown> | null;

interface DocumentItem {
  id: string;
  tipoDocumento?: string;
  estado?: string;
  fileUrl?: string;
  fechaSubida?: { toMillis?: () => number };
  updatedAt?: { toMillis?: () => number };
  fechaVencimiento?: { toMillis?: () => number };
}

function formatDate(ts?: { toMillis?: () => number } | null): string {
  if (!ts?.toMillis) return 'Dato no provisto';
  return new Date(ts.toMillis()).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const LABEL_MAP: Record<string, string> = {
  fechanacimiento: 'Fecha de Nacimiento',
  diagraroster: 'Diagrama / Roster',
  diagramaroster: 'Diagrama / Roster',
  pernoctecampamento: 'Pernocte en Campamento',
  updatedat: 'Última Actualización',
  razonSocial: 'Razón Social',
};

function humanizeLabel(key: string): string {
  const normalized = key.replace(/\s+/g, '').replace(/_/g, '').toLowerCase();
  if (LABEL_MAP[normalized]) return LABEL_MAP[normalized];
  const withSpaces = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  return withSpaces.length ? withSpaces.replace(/^\w/, (c) => c.toUpperCase()) : 'Dato';
}

function humanizeValue(value: unknown): string {
  if (value === null || value === undefined) return 'Dato no provisto';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'string') return value.trim() ? value : 'Dato no provisto';
  return String(value);
}

const ESG_DOC_TIPOS = ['politica_medio_ambiente', 'codigo_etica', 'reporte_sustentabilidad'];

export function AuditorPerfilDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [user, setUser] = useState<UserBasic | null>(null);
  const [profile, setProfile] = useState<ProfileData>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esgUpdating, setEsgUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Usuario no encontrado.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const userData = await getUserById(id);
        if (!userData) {
          setError('Usuario no encontrado.');
          setLoading(false);
          return;
        }
        setUser(userData);
        const role = userData.role === 'proveedor' ? 'proveedor' : 'profesional';
        const [profileData, docs] = await Promise.all([
          getProfileDetail(id, role),
          getDocumentsByUser(id),
        ]);
        setProfile(profileData?.data ?? null);
        const orderedDocs = docs
          .map((d: any) => ({
            id: d.id,
            tipoDocumento: d.tipoDocumento ?? '',
            estado: d.estado ?? 'pendiente',
            fileUrl: d.fileUrl ?? '',
            fechaSubida: d.fechaSubida ?? d.updatedAt ?? null,
            updatedAt: d.updatedAt ?? null,
            fechaVencimiento: d.fechaVencimiento ?? null,
          }))
          .sort((a, b) => {
            const aTs = a.fechaSubida?.toMillis?.() ?? 0;
            const bTs = b.fechaSubida?.toMillis?.() ?? 0;
            return bTs - aTs;
          });
        setDocuments(orderedDocs);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el perfil. Intentá nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const displayName = useMemo(() => {
    if (profile) {
      const razon = (profile as any)?.razonSocial || (profile as any)?.empresa;
      const nombre = (profile as any)?.nombre;
      if (razon) return razon as string;
      if (nombre) return nombre as string;
    }
    return user?.nombre || user?.empresa || user?.email || 'Usuario';
  }, [profile, user]);

  const roleBadgeColor =
    user?.role === 'proveedor'
      ? 'bg-blue-100 text-blue-700'
      : user?.role === 'profesional'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-slate-100 text-slate-700';

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 rounded-xl p-8 text-red-700">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => navigate('/dashboard/auditor/directorio')}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500"
            >
              Volver al directorio
            </button>
          </div>
        ) : (
          <>
            <header className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-2">
              <button
                onClick={() => navigate('/dashboard/auditor/directorio')}
                className="text-sm text-slate-500 hover:text-slate-900 mb-2 inline-flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Directorio
              </button>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 break-words">{displayName}</h1>
                  <p className="text-sm text-slate-600 break-words">{user?.email}</p>
                  <p className="text-xs text-slate-500">Registro: {formatDate(user?.createdAt)}</p>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadgeColor}`}>
                  {user?.role ?? 'rol'}
                </span>
              </div>
            </header>

            <div className="flex flex-col gap-8 w-full">
              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 w-full">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                  Datos del perfil
                </h2>
                {profile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(profile)
                      .filter(([k]) => k !== 'esg')
                      .map(([k, v]) => (
                        <InfoItem key={k} label={humanizeLabel(k)} value={humanizeValue(v)} />
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Dato no provisto.</p>
                )}
              </section>

              <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Historial documental</h2>
                  <span className="text-sm text-slate-500">{documents.length} documentos</span>
                </div>
                {documents.length === 0 ? (
                  <p className="text-sm text-slate-500">Sin documentos cargados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-4 font-semibold text-slate-700">Documento</th>
                          <th className="text-left px-4 py-4 font-semibold text-slate-700">Estado</th>
                          <th className="text-left px-4 py-4 font-semibold text-slate-700 whitespace-nowrap">Fecha subida</th>
                          <th className="text-left px-4 py-4 font-semibold text-slate-700 whitespace-nowrap">Vencimiento</th>
                          <th className="text-left px-4 py-4 font-semibold text-slate-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((d) => (
                          <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-4 text-slate-800 capitalize">{d.tipoDocumento || 'Documento'}</td>
                            <td className="px-4 py-4">
                              <StatusBadge estado={d.estado} />
                            </td>
                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(d.fechaSubida ?? d.updatedAt)}</td>
                            <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(d.fechaVencimiento)}</td>
                            <td className="px-4 py-4">
                              {d.fileUrl ? (
                                <Link
                                  to={d.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Ver PDF
                                </Link>
                              ) : (
                                <span className="text-xs text-slate-500">No hay archivo</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Sección Evaluación ESG (solo proveedores) */}
              {user?.role === 'proveedor' && (
                <SeccionEvaluacionESG
                  profile={profile}
                  documents={documents}
                  userId={id!}
                  onSelloUpdate={() => {
                    getProfileDetail(id!, 'proveedor').then((r) =>
                      setProfile(r?.data ?? null)
                    );
                  }}
                  esgUpdating={esgUpdating}
                  setEsgUpdating={setEsgUpdating}
                  addToast={addToast}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface SeccionEvaluacionESGProps {
  profile: ProfileData;
  documents: DocumentItem[];
  userId: string;
  onSelloUpdate: () => void;
  esgUpdating: boolean;
  setEsgUpdating: (v: boolean) => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

function SeccionEvaluacionESG({
  profile,
  documents,
  userId,
  onSelloUpdate,
  esgUpdating,
  setEsgUpdating,
  addToast,
}: SeccionEvaluacionESGProps) {
  const esg = (profile?.esg as Record<string, unknown> | undefined) ?? null;
  const docsESG = documents.filter(
    (d) => d.tipoDocumento && ESG_DOC_TIPOS.includes(d.tipoDocumento as string)
  );
  const estadoSello = (esg?.estadoSello as EstadoSelloVerde | undefined) ?? 'incompleto';
  const selloOtorgado = estadoSello === 'sello_otorgado';

  const handleOtorgar = async () => {
    setEsgUpdating(true);
    try {
      await updateProveedorESGSello(userId, 'sello_otorgado');
      onSelloUpdate();
      addToast('Sello Verde otorgado correctamente.');
    } catch (err) {
      console.error(err);
      addToast('Error al otorgar el Sello Verde.', 'error');
    } finally {
      setEsgUpdating(false);
    }
  };

  const handleRechazar = async () => {
    setEsgUpdating(true);
    try {
      await updateProveedorESGSello(userId, 'rechazado');
      onSelloUpdate();
      addToast('Sello Verde rechazado.');
    } catch (err) {
      console.error(err);
      addToast('Error al rechazar el Sello Verde.', 'error');
    } finally {
      setEsgUpdating(false);
    }
  };

  const docLabels: Record<string, string> = {
    politica_medio_ambiente: 'Política de Medio Ambiente',
    codigo_etica: 'Código de Ética y Conducta',
    reporte_sustentabilidad: 'Reporte de Sustentabilidad',
  };

  const detalleEnergias: string = (esg?.energiasRenovablesDetalle as string) || '';
  const detalleEquidad: string = (esg?.equidadGeneroDetalle as string) || '';

  return (
    <section
      className={`border rounded-xl p-6 space-y-6 w-full ${
        selloOtorgado ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
      }`}
    >
      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <Leaf className="w-5 h-5 text-emerald-600" />
        Evaluación de Impacto y ESG
      </h2>

      {!esg || (typeof esg === 'object' && Object.keys(esg).length === 0) ? (
        <p className="text-sm text-slate-500 italic">
          Este proveedor aún no ha completado su perfil de Sustentabilidad.
        </p>
      ) : (
        <>
          {/* Métricas y detalles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-700">Métricas de Impacto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {esg.pctEmpleadosLocales != null && (
                <InfoItem
                  label="% Empleados locales"
                  value={String(esg.pctEmpleadosLocales)}
                />
              )}
              <InfoItem
                label="Energías renovables"
                value={esg.energiasRenovables ? 'Sí' : 'No'}
              />
              {Boolean(esg.energiasRenovables && detalleEnergias) ? (
                <div className="sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Detalle</p>
                  <p className="text-sm text-slate-800">{detalleEnergias}</p>
                </div>
              ) : null}
              <InfoItem
                label="Equidad de género"
                value={esg.equidadGenero ? 'Sí' : 'No'}
              />
              {Boolean(esg.equidadGenero && detalleEquidad) ? (
                <div className="sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Detalle</p>
                  <p className="text-sm text-slate-800">{detalleEquidad}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Proyectos RSE */}
          {(esg.proyectosRSE as Array<{ titulo: string; descripcion: string; inversionEstimada?: string }>)?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Proyectos Declarados</h3>
              <div className="space-y-2">
                {((esg.proyectosRSE as Array<{ titulo: string; descripcion: string; inversionEstimada?: string }>) ?? []).map(
                  (p, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <p className="font-medium text-slate-800">{p.titulo}</p>
                      {p.inversionEstimada && (
                        <p className="text-xs text-slate-500 mt-1">Inversión: {p.inversionEstimada}</p>
                      )}
                      <p className="text-sm text-slate-600 mt-2">{p.descripcion}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Políticas (PDFs) */}
          {docsESG.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Políticas Corporativas</h3>
              <div className="flex flex-wrap gap-2">
                {docsESG.map((d) => (
                  <Link
                    key={d.id}
                    to={d.fileUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {docLabels[d.tipoDocumento as string] ?? d.tipoDocumento}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Panel de control Sello Verde */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Dictamen del Sello Verde</h3>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-slate-600">
                Estado actual:{' '}
                <span
                  className={`font-semibold ${
                    selloOtorgado
                      ? 'text-emerald-700'
                      : estadoSello === 'rechazado'
                        ? 'text-red-700'
                        : estadoSello === 'en_revision'
                          ? 'text-amber-700'
                          : 'text-slate-600'
                  }`}
                >
                  {estadoSello === 'sello_otorgado'
                    ? 'Sello Verde Otorgado y Vigente'
                    : estadoSello === 'rechazado'
                      ? 'Rechazado'
                      : estadoSello === 'en_revision'
                        ? 'En Revisión'
                        : 'Incompleto'}
                </span>
              </span>
              {selloOtorgado && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-medium">
                  <Award className="w-4 h-4" />
                  Sello Verde Otorgado y Vigente
                </span>
              )}
              {!selloOtorgado && (
                <div className="flex gap-2">
                  <button
                    onClick={handleOtorgar}
                    disabled={esgUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition disabled:opacity-60"
                  >
                    {esgUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Otorgar Sello Verde
                  </button>
                  <button
                    onClick={handleRechazar}
                    disabled={esgUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 font-medium hover:bg-red-50 transition disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar / Revocar Sello
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800 mt-1 break-words">{value || 'Dato no provisto'}</p>
    </div>
  );
}

function StatusBadge({ estado }: { estado?: string }) {
  const normalized = (estado || 'pendiente').toLowerCase();
  const color =
    normalized === 'aprobado'
      ? 'bg-emerald-100 text-emerald-700'
      : normalized === 'rechazado' || normalized === 'vencido'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {normalized}
    </span>
  );
}
