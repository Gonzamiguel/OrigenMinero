import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  Check,
  Building2,
  HardHat,
  Award,
  Eye,
  Download,
  User,
  Briefcase,
  Calendar,
  UserPlus,
  CheckCircle,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useEmpresaFavoritos } from '../../../hooks/useEmpresaFavoritos';
import { getContratistasVinculados, toggleContratistaNomina } from '../../../lib/firebase/empresaService';
import { getPerfilById } from '../../../lib/firebase/networkService';
import { getProfileDetail, getDocumentsByUser } from '../../../lib/firebase/auditorService';
import {
  TIPO_ENTIDAD,
  TAMANO_EMPRESA,
  NORMAS_ISO,
  DIAGRAMA_ROSTER,
  EXPERIENCIA_MINERIA,
  SITUACION_LABORAL,
} from '../../../data/mockData';
import type { Perfil } from '../../../types';

const DOC_LABELS: Record<string, string> = {
  afip: 'Constancia AFIP',
  art: 'Certificado ART',
  seguro: 'Pólizas de Seguro',
  mipyme: 'Certificado MiPyME',
  libre_deuda: 'Certificado Libre Deuda',
  residencia: 'Residencia',
};

const ND = 'Dato no proporcionado';

function StatusBadge({ estado }: { estado?: string }) {
  const normalized = (estado || 'pendiente').toLowerCase();
  const color =
    normalized === 'ok'
      ? 'bg-emerald-100 text-emerald-700'
      : normalized === 'vencido' || normalized === 'rechazado'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
  const label =
    normalized === 'ok'
      ? 'Aprobado'
      : normalized === 'vencido'
        ? 'Vencido'
        : normalized === 'en_revision'
          ? 'En revisión'
          : 'Pendiente';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function DataItem({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  const display =
    value === null || value === undefined || value === ''
      ? ND
      : typeof value === 'boolean'
        ? value
          ? 'Sí'
          : 'No'
        : String(value);
  const isPlaceholder = display === ND;
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p
        className={`text-sm mt-1 break-words ${
          isPlaceholder ? 'text-slate-400 italic' : 'text-slate-800'
        }`}
      >
        {display}
      </p>
    </div>
  );
}

interface DocFirebase {
  id: string;
  tipoDocumento?: string;
  fileName?: string;
  nombreOriginal?: string;
  estado?: string;
  fileUrl?: string;
}

export function EmpresaPerfilDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { perfiles, perfilesLoading, addToast } = useApp();
  const { user } = useAuth();
  const { isFavorito, toggleFavorito } = useEmpresaFavoritos();
  const [contactoRevelado, setContactoRevelado] = useState(false);
  const [contratistasVinculados, setContratistasVinculados] = useState<string[]>([]);
  const [nominaLoading, setNominaLoading] = useState(false);
  const [perfilExterno, setPerfilExterno] = useState<Perfil | null>(null);
  const [fullProfileData, setFullProfileData] = useState<Record<string, unknown> | null>(null);
  const [docsFirebase, setDocsFirebase] = useState<DocFirebase[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  const perfil = perfiles.find((p: Perfil) => p.id === id) ?? perfilExterno;
  const esProveedor = perfil?.tipo === 'proveedor';

  useEffect(() => {
    if (!id) return;
    const perfilEnLista = perfiles.find((p: Perfil) => p.id === id);
    if (perfilEnLista) {
      setPerfilExterno(null);
      getDocumentsByUser(id).then((docs: unknown[]) =>
        setDocsFirebase(
          (docs as Array<DocFirebase & { fileUrl?: string; nombreOriginal?: string }>).map((d) => ({
            id: d.id,
            tipoDocumento: d.tipoDocumento,
            fileName: d.fileName ?? d.nombreOriginal,
            nombreOriginal: d.nombreOriginal,
            estado: d.estado,
            fileUrl: d.fileUrl,
          }))
        )
      );
      if (perfilEnLista.tipo === 'proveedor') {
        getProfileDetail(id, 'proveedor').then((r) =>
          setFullProfileData(r?.data ?? null)
        );
      } else if (perfilEnLista.tipo === 'profesional') {
        getProfileDetail(id, 'profesional').then((r) =>
          setFullProfileData(r?.data ?? null)
        );
      } else {
        setFullProfileData(null);
      }
      return;
    }
    setLoadingDetalle(true);
    getPerfilById(id)
      .then((p) => {
        setPerfilExterno(p ?? null);
        if (p) {
          getDocumentsByUser(id).then((docs: unknown[]) =>
            setDocsFirebase(
              (docs as Array<DocFirebase & { fileUrl?: string; nombreOriginal?: string }>).map((d) => ({
                id: d.id,
                tipoDocumento: d.tipoDocumento,
                fileName: d.fileName ?? d.nombreOriginal,
                nombreOriginal: d.nombreOriginal,
                estado: d.estado,
                fileUrl: d.fileUrl,
              }))
            )
          );
          if (p.tipo === 'proveedor') {
            return getProfileDetail(id, 'proveedor').then((r) =>
              setFullProfileData(r?.data ?? null)
            );
          }
          if (p.tipo === 'profesional') {
            return getProfileDetail(id, 'profesional').then((r) =>
              setFullProfileData(r?.data ?? null)
            );
          }
          setFullProfileData(null);
        }
        return Promise.resolve();
      })
      .catch(() => setPerfilExterno(null))
      .finally(() => setLoadingDetalle(false));
  }, [id, perfiles]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    getContratistasVinculados(uid).then(setContratistasVinculados);
  }, [user?.uid]);

  const enNomina = id ? contratistasVinculados.includes(id) : false;

  const handleToggleNomina = async () => {
    if (!id || !user?.uid) return;
    setNominaLoading(true);
    try {
      const { added } = await toggleContratistaNomina(user.uid, id);
      setContratistasVinculados((prev) =>
        added ? [...prev, id] : prev.filter((x) => x !== id)
      );
      addToast(
        added
          ? 'Proveedor añadido a tu nómina de monitoreo.'
          : 'Proveedor desvinculado.'
      );
    } catch (err) {
      console.error(err);
      addToast('Error al actualizar la nómina.', 'error');
    } finally {
      setNominaLoading(false);
    }
  };

  const docsConArchivo = docsFirebase.filter((d) => d.fileUrl);

  const handleDownloadIndividual = async (doc: DocFirebase) => {
    if (!doc.fileUrl) return;
    try {
      const res = await fetch(doc.fileUrl);
      const blob = await res.blob();
      const nombre = (doc.fileName ?? doc.nombreOriginal ?? `${doc.tipoDocumento ?? 'documento'}.pdf`).replace(/\s+/g, '_');
      saveAs(blob, nombre);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadZip = async () => {
    if (!perfil || docsConArchivo.length === 0) return;
    setZipLoading(true);
    try {
      const zip = new JSZip();
      const razonSocial = (perfil.empresa || perfil.nombre || 'proveedor').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
      for (const doc of docsConArchivo) {
        if (!doc.fileUrl) continue;
        try {
          const res = await fetch(doc.fileUrl);
          const blob = await res.blob();
          const nombre = `${doc.tipoDocumento ?? 'documento'}_${doc.fileName ?? doc.id}.pdf`.replace(/\s+/g, '_');
          zip.file(nombre, blob);
        } catch {
          console.warn(`No se pudo obtener ${doc.tipoDocumento}`);
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `Legajo_${razonSocial}.zip`);
    } catch (err) {
      console.error(err);
    } finally {
      setZipLoading(false);
    }
  };

  if (perfilesLoading || (loadingDetalle && !perfil)) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-red-700">
            <p className="font-semibold">Perfil no encontrado.</p>
            <button
              onClick={() => navigate('/dashboard/empresa/buscar')}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500"
            >
              Volver al Buscador
            </button>
          </div>
        </div>
      </div>
    );
  }

  const titulo = perfil.empresa || perfil.nombre;
  const docsFromSemaforo = Object.entries(perfil.semaforo)
    .filter(([, v]) => v)
    .map(([tipo, estado]) => ({
      tipo,
      label: DOC_LABELS[tipo] || tipo,
      estado:
        estado === 'ok' ? 'aprobado' : estado === 'vencido' ? 'vencido' : 'pendiente',
    }));

  const data = fullProfileData ?? {};
  const get = (key: string) => data[key] ?? data[key.charAt(0).toLowerCase() + key.slice(1)];

  const tipoEntidadLabel =
    TIPO_ENTIDAD.find((t) => t.value === get('tipoEntidad'))?.label ?? get('tipoEntidad');
  const tamanoLabel =
    TAMANO_EMPRESA.find((t) => t.value === get('tamanoEmpresa'))?.label ?? get('tamanoEmpresa');
  const experienciaMinera = get('experienciaMineraPrevia') as boolean | null | undefined;
  const normasISO = (get('normasISO') as string[] | undefined) ?? [];
  const registroProvincial = get('registroProvincial') as boolean | undefined;
  const programaRSEActivo = get('programaRSEActivo') as boolean | undefined;

  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <header className="bg-white border border-slate-200 rounded-xl p-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-slate-900 mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>
              <p className="text-slate-600 mt-1">
                {perfil.rubro || perfil.oficio} • {perfil.localidad}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleFavorito(perfil.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                isFavorito(perfil.id)
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={isFavorito(perfil.id) ? 'fill-current' : ''}>★</span>
              {isFavorito(perfil.id) ? 'En Favoritos' : 'Guardar en Favoritos'}
            </button>
          </div>
        </header>

        {esProveedor && (
          <>
            {/* Bloque A: Perfil Corporativo */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-slate-600" />
                Perfil Corporativo
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DataItem label="CUIT" value={get('cuit') as string} />
                <DataItem
                  label="Tipo de Entidad"
                  value={tipoEntidadLabel ? String(tipoEntidadLabel) : undefined}
                />
                <DataItem
                  label="Localidad / Sede principal"
                  value={(get('localidad') as string) ?? perfil.localidad}
                />
              </div>
            </section>

            {/* Bloque B: Capacidad Operativa */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <HardHat className="w-5 h-5 text-slate-600" />
                Capacidad Operativa
              </h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DataItem
                    label="Tamaño de Empresa / Rango de Empleados"
                    value={tamanoLabel ? String(tamanoLabel) : undefined}
                  />
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                      Experiencia Minera
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        experienciaMinera === true
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {experienciaMinera === true
                        ? 'Con Experiencia Minera'
                        : experienciaMinera === false
                          ? 'Sin experiencia previa'
                          : ND}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                    Descripción de Flota/Equipamiento
                  </p>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-800">
                    {(get('descripcionFlota') as string) || (perfil.descripcion as string) || (
                      <span className="text-slate-400 italic">{ND}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Bloque C: Certificaciones y Calidad */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 ring-1 ring-amber-200/50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-600" />
                Certificaciones y Calidad
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                    Normas ISO
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {NORMAS_ISO.map((n) => {
                      const tiene = normasISO.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          className={`flex items-center gap-2 ${
                            tiene ? 'text-emerald-700' : 'text-slate-400 line-through'
                          }`}
                        >
                          {tiene ? (
                            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <span className="w-5 h-5 flex-shrink-0" />
                          )}
                          <span>{n.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div
                    className={`flex items-center gap-2 ${
                      registroProvincial ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {registroProvincial ? (
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <span className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span
                      className={
                        registroProvincial ? '' : 'line-through'
                      }
                    >
                      Inscripto en Registro de Proveedores Locales
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      programaRSEActivo === true
                        ? 'text-emerald-700'
                        : programaRSEActivo === false
                          ? 'text-slate-400'
                          : 'text-slate-400'
                    }`}
                  >
                    {programaRSEActivo === true ? (
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <span className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span
                      className={
                        programaRSEActivo === true ? '' : 'line-through'
                      }
                    >
                      Programa de RSE Activo
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {!esProveedor && (
          <div className="flex flex-col gap-6">
            {/* Bloque A: Información Personal y Fiscal */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-slate-600" />
                Información Personal y Fiscal
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DataItem label="Nombre Completo" value={(get('nombre') as string) ?? perfil.nombre} />
                <DataItem label="CUIL" value={get('cuil') as string} />
                <DataItem
                  label="Fecha de Nacimiento"
                  value={
                    (get('fechaNacimiento') as string)
                      ? new Date(get('fechaNacimiento') as string).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : undefined
                  }
                />
                <DataItem label="Localidad" value={(get('localidad') as string) ?? perfil.localidad} />
                <div className="sm:col-span-2">
                  <DataItem label="Domicilio" value={get('domicilio') as string} />
                </div>
              </div>
            </section>

            {/* Bloque B: Perfil Laboral y Experiencia */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-slate-600" />
                Perfil Laboral y Experiencia
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Oficio / Profesión principal</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {(get('oficio') as string) ?? perfil.oficio ?? (
                      <span className="text-slate-400 italic font-normal">{ND}</span>
                    )}
                  </p>
                </div>
                <DataItem
                  label="Años de Experiencia"
                  value={
                    EXPERIENCIA_MINERIA.find((e) => e.value === get('experienciaMineria'))?.label ??
                    (get('experienciaMineria') as string)
                  }
                />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Descripción / Resumen</p>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700">
                    {(get('descripcion') as string) ?? perfil.descripcion ?? (
                      <span className="text-slate-400 italic">{ND}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Bloque C: Disponibilidad y Modalidad */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-slate-600" />
                Disponibilidad y Modalidad
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Diagrama / Roster</p>
                  <p className="text-sm text-slate-800">
                    {DIAGRAMA_ROSTER.find((d) => d.value === get('diagramaRoster'))?.label ??
                      (get('diagramaRoster') as string) ?? (
                        <span className="text-slate-400 italic">{ND}</span>
                      )}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Pernocte en Campamento</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      get('pernocteCampamento') === true
                        ? 'bg-emerald-100 text-emerald-700'
                        : get('pernocteCampamento') === false
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {get('pernocteCampamento') === true
                      ? 'Sí, disponible para pernocte'
                      : get('pernocteCampamento') === false
                        ? 'No'
                        : ND}
                  </span>
                </div>
                <div className="sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Disponibilidad</p>
                  <p className="text-sm text-slate-800">
                    {SITUACION_LABORAL.find((s) => s.value === get('situacionLaboral'))?.label ??
                      (get('situacionLaboral') as string) ?? (
                        <span className="text-slate-400 italic">{ND}</span>
                      )}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tabla de Documentación (último bloque antes del CTA) */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-slate-600" />
            Documentación (estado del auditor)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Documento
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docsFirebase.length > 0 ? (
                  docsFirebase.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-800">
                        {(DOC_LABELS[d.tipoDocumento ?? ''] || d.tipoDocumento) ?? 'Documento'}{' '}
                        {(d.fileName ?? d.nombreOriginal) ? `— ${d.fileName ?? d.nombreOriginal}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          estado={
                            d.estado === 'aprobado'
                              ? 'aprobado'
                              : d.estado === 'rechazado'
                                ? 'vencido'
                                : 'pendiente'
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {d.fileUrl ? (
                            <>
                              <a
                                href={d.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
                                title="Ver"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDownloadIndividual(d)}
                                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
                                title="Descargar"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">Sin archivo</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  docsFromSemaforo.map((d) => (
                    <tr key={d.tipo} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-800">{d.label}</td>
                      <td className="px-4 py-3">
                        <StatusBadge estado={d.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">Sin archivo cargado</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {docsConArchivo.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={zipLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-700 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {zipLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Comprimiendo...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar Legajo Completo (.zip)
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* CTA Contactar */}
        <section className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          {/* Botón Nómina */}
          {user?.uid && (
            <div className="mb-6">
              <button
                onClick={handleToggleNomina}
                disabled={nominaLoading}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition border-2 ${
                  enNomina
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                } disabled:opacity-60`}
              >
                {nominaLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : enNomina ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                {enNomina ? 'En mi Nómina Activa' : 'Vincular a mi Nómina'}
              </button>
            </div>
          )}
          {!contactoRevelado ? (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                ¿Querés contactar a este proveedor?
              </h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Al hacer clic en el botón se revelará el email y teléfono de contacto para que
                puedas comunicarte directamente.
              </p>
              <button
                onClick={() => setContactoRevelado(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-xl hover:bg-emerald-500 transition shadow-lg"
              >
                Contactar Proveedor
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Datos de contacto</h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {perfil.email && (
                  <a
                    href={`mailto:${perfil.email}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition text-slate-800"
                  >
                    <Mail className="w-5 h-5" />
                    {perfil.email}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {perfil.telefono && (
                  <a
                    href={`tel:${perfil.telefono.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition text-slate-800"
                  >
                    <Phone className="w-5 h-5" />
                    {perfil.telefono}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {!perfil.email && !perfil.telefono && (
                <p className="text-slate-500">
                  Este proveedor no ha compartido datos de contacto.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
