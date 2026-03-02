import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Shield } from 'lucide-react';
import {
  getUserById,
  getProfileDetail,
  getDocumentsByUser,
  type UserBasic,
} from '../../../lib/firebase/auditorService';

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

export function AuditorPerfilDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserBasic | null>(null);
  const [profile, setProfile] = useState<ProfileData>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                    {Object.entries(profile).map(([k, v]) => (
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
            </div>
          </>
        )}
      </div>
    </div>
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
