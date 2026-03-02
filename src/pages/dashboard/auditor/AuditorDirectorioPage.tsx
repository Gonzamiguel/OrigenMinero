import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Users, FileDown, Eye, X, ExternalLink } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import {
  getNetworkUsers,
  getProfileDetail,
  getDocumentsByUser,
  type NetworkUser,
} from '../../../lib/firebase/auditorService';

interface UserDetailState {
  profile: Record<string, unknown> | null;
  docs: Array<{ id: string; tipoDocumento?: string; estado?: string; fileUrl?: string }>;
  loading: boolean;
  error: string | null;
}

function formatDate(ts?: { toMillis: () => number } | null): string {
  if (!ts) return '-';
  return new Date(ts.toMillis()).toLocaleDateString('es-AR');
}

function formatCreatedAt(value: unknown): string {
  const ts = value as { toMillis?: () => number };
  if (ts?.toMillis) return formatDate(ts as { toMillis: () => number });
  if (typeof value === 'string') return new Date(value).toLocaleDateString('es-AR');
  return '-';
}

export function AuditorDirectorioPage() {
  const { addToast } = useApp();
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NetworkUser | null>(null);
  const [detail, setDetail] = useState<UserDetailState>({
    profile: null,
    docs: [],
    loading: false,
    error: null,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNetworkUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar el directorio.');
      addToast('Error al cargar el directorio', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSelect = async (user: NetworkUser) => {
    setSelected(user);
    setDetail({ profile: null, docs: [], loading: true, error: null });
    try {
      const [profile, docs] = await Promise.all([
        getProfileDetail(user.id, user.role === 'proveedor' ? 'proveedor' : 'profesional'),
        getDocumentsByUser(user.id),
      ]);
      setDetail({
        profile: profile?.data ?? null,
        docs: docs.map((d) => ({
          id: d.id,
          tipoDocumento: (d as any).tipoDocumento ?? '',
          estado: (d as any).estado ?? 'pendiente',
          fileUrl: (d as any).fileUrl ?? '',
        })),
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error(err);
      setDetail({ profile: null, docs: [], loading: false, error: 'Error al cargar el detalle.' });
      addToast('No se pudo cargar el detalle', 'error');
    }
  };

  const exportCsv = () => {
    if (users.length === 0) return;
    const headers = ['Nombre/Razón Social', 'Email', 'Rol', 'Fecha de Registro'];
    const rows = users.map((u) => [
      `"${(u.nombre || u.empresa || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${u.role}"`,
      `"${formatCreatedAt(u.createdAt)}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'directorio-auditor.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const tableData = useMemo(() => users, [users]);

  const displayName =
    (detail.profile as Record<string, unknown> | null)?.razonSocial?.toString?.() ||
    (detail.profile as Record<string, unknown> | null)?.nombre?.toString?.() ||
    selected?.nombre ||
    selected?.empresa ||
    selected?.email ||
    '';

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-slate-700" />
              Directorio de Red
            </h1>
            <p className="text-slate-600 mt-1">Visión 360° de proveedores y profesionales.</p>
          </div>
          <button
            onClick={exportCsv}
            disabled={users.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-600">
              <p className="font-semibold">{error}</p>
              <button
                onClick={load}
                className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500"
              >
                Reintentar
              </button>
            </div>
          ) : tableData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Users className="w-10 h-10 mb-3 opacity-60" />
              <p className="font-medium">No hay registros para mostrar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700">Nombre / Razón Social</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Rol</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Fecha de registro</th>
                    <th className="text-left p-4 font-semibold text-slate-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-medium text-slate-800 truncate">{u.nombre || u.empresa || u.email}</p>
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{formatCreatedAt(u.createdAt)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSelect(u)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setSelected(null)}
          />
          <div className="fixed inset-y-0 right-0 z-[110] w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex justify-between items-start gap-4 mb-6 px-6 py-4 border-b border-slate-200 bg-white sticky top-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Ficha 360</p>
                <h2 className="text-2xl font-bold text-slate-900 truncate">
                  {displayName}
                </h2>
                <p className="text-sm text-slate-500 font-normal truncate">{selected.email}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  to={`/dashboard/auditor/directorio/${selected.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  onClick={() => setSelected(null)}
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver perfil completo
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-64px)] overflow-y-auto p-6 space-y-6">
              {detail.loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : detail.error ? (
                <p className="text-red-600">{detail.error}</p>
              ) : (
                <>
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={selected.role} />
                      <span className="text-sm text-slate-500">Registro: {formatCreatedAt(selected.createdAt)}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem label="Nombre / Razón social" value={selected.nombre || selected.empresa || '-'} />
                      <InfoItem label="Email" value={selected.email} />
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Datos de perfil</h3>
                    {detail.profile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(detail.profile).map(([k, v]) => (
                          <InfoItem key={k} label={k} value={String(v ?? '') || '-'} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Sin datos de perfil.</p>
                    )}
                  </section>

                  <hr className="border-slate-200" />

                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">Estado de Documentación</h3>
                    </div>
                    {detail.docs.length === 0 ? (
                      <p className="text-sm text-slate-500">Sin documentos cargados.</p>
                    ) : (
                      <div className="space-y-2">
                        {detail.docs.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-800 capitalize">
                                {d.tipoDocumento || 'Documento'}
                              </span>
                              {d.fileUrl && (
                                <a
                                  href={d.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                                >
                                  Ver archivo
                                </a>
                              )}
                            </div>
                            <StatusBadge estado={d.estado} />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800 mt-1 break-words">{value || '-'}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const color =
    role === 'proveedor'
      ? 'bg-blue-100 text-blue-700'
      : role === 'profesional'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${color}`}>
      {role}
    </span>
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
