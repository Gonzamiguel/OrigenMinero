import { getNetworkUsers, getProfileDetail, getDocumentsByUser, getUserById } from './auditorService';
import type { Perfil } from '../../types';
import type { EstadoDocumento } from '../../types';

const SEMAFORO_KEYS = ['afip', 'art', 'seguro', 'residencia', 'mipyme', 'libre_deuda'] as const;

const TIPO_TO_SEMAFORO: Record<string, string> = {
  afip: 'afip',
  art: 'art',
  seguro: 'seguro',
  residencia: 'residencia',
  mipyme: 'mipyme',
  libre_deuda: 'libre_deuda',
  'constancia afip': 'afip',
  'certificado mipyme': 'mipyme',
  'certificado de libre deuda': 'libre_deuda',
  'seguro rc': 'seguro',
  dni: 'residencia',
  otro: 'seguro',
};

function normalizeTipo(tipo: string): string | null {
  const key = tipo.toLowerCase().replace(/-/g, '_').replace(/\s+/g, ' ').trim();
  return TIPO_TO_SEMAFORO[key] ?? TIPO_TO_SEMAFORO[key.replace('certificado ', '')] ?? null;
}

function mapDocumentoEstado(
  estado: string,
  fechaVencimiento?: { toMillis?: () => number } | null
): EstadoDocumento {
  if (estado === 'aprobado') {
    if (fechaVencimiento?.toMillis) {
      const venc = fechaVencimiento.toMillis();
      if (venc < Date.now()) return 'vencido';
    }
    return 'ok';
  }
  if (estado === 'pendiente') return 'en_revision';
  if (estado === 'rechazado') return 'vencido';
  return 'pendiente';
}

function buildSemaforo(docs: Array<Record<string, unknown>>) {
  const semaforo: Record<string, EstadoDocumento> = {
    afip: 'pendiente',
    art: 'pendiente',
    seguro: 'pendiente',
  };

  for (const doc of docs) {
    const tipoRaw = String(doc.tipoDocumento ?? '').trim();
    const tipo = normalizeTipo(tipoRaw);
    if (!tipo || !SEMAFORO_KEYS.includes(tipo as (typeof SEMAFORO_KEYS)[number])) continue;

    const estado = mapDocumentoEstado(String(doc.estado ?? 'pendiente'), doc.fechaVencimiento as { toMillis?: () => number } | null | undefined);
    if (!semaforo[tipo] || estado === 'ok') {
      semaforo[tipo] = estado;
    }
  }

  return semaforo as Perfil['semaforo'];
}

/**
 * Obtiene todos los perfiles de proveedores y profesionales desde Firebase
 * para mostrar en el Buscador de Red, Proveedores, Profesionales, etc.
 */
export async function getPerfilesRed(): Promise<Perfil[]> {
  const users = await getNetworkUsers();
  const perfiles: Perfil[] = [];

  for (const user of users) {
    const role = user.role as 'proveedor' | 'profesional';
    const profileDetail = await getProfileDetail(user.id, role);
    const docs = await getDocumentsByUser(user.id);

    const profileData = profileDetail?.data ?? {};
    const nombre = (profileData.nombre as string) ?? user.nombre ?? user.email ?? 'Sin nombre';
    const empresa = (profileData.empresa as string) ?? (role === 'proveedor' ? nombre : undefined);
    const localidad = (profileData.localidad as string) ?? '';
    const descripcion = (profileData.descripcion as string) ?? '';

    const semaforo = buildSemaforo(docs);

    perfiles.push({
      id: user.id,
      tipo: role,
      nombre,
      empresa: role === 'proveedor' ? (empresa || nombre) : undefined,
      rubro: profileData.rubro as string | undefined,
      oficio: profileData.oficio as string | undefined,
      localidad: localidad || 'Sin especificar',
      descripcion: descripcion || '',
      selloValidado: false,
      selloSustentable: false,
      semaforo,
      telefono: (profileData.telefono as string) ?? undefined,
      email: (profileData.email as string) ?? user.email ?? undefined,
    });
  }

  return perfiles;
}

/**
 * Obtiene un perfil por ID (para vista detalle cuando no está en caché).
 */
export async function getPerfilById(userId: string): Promise<Perfil | null> {
  const user = await getUserById(userId);
  if (!user || (user.role !== 'proveedor' && user.role !== 'profesional')) return null;

  const role = user.role as 'proveedor' | 'profesional';
  const profileDetail = await getProfileDetail(userId, role);
  const docs = await getDocumentsByUser(userId);

  const profileData = profileDetail?.data ?? {};
  const nombre = (profileData.nombre as string) ?? user.nombre ?? user.email ?? 'Sin nombre';
  const empresa = (profileData.empresa as string) ?? (role === 'proveedor' ? nombre : undefined);
  const localidad = (profileData.localidad as string) ?? '';
  const descripcion = (profileData.descripcion as string) ?? '';

  const semaforo = buildSemaforo(docs);

  return {
    id: user.id,
    tipo: role,
    nombre,
    empresa: role === 'proveedor' ? (empresa || nombre) : undefined,
    rubro: profileData.rubro as string | undefined,
    oficio: profileData.oficio as string | undefined,
    localidad: localidad || 'Sin especificar',
    descripcion: descripcion || '',
    selloValidado: false,
    selloSustentable: false,
    semaforo,
    telefono: (profileData.telefono as string) ?? undefined,
    email: (profileData.email as string) ?? user.email ?? undefined,
  };
}
