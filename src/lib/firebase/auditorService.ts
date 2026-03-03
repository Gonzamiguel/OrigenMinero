import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { UserRole } from './types';

const COL_USERS = 'users';
const COL_DOCUMENTOS = 'documentos';
const COL_PERFILES_PROVEEDORES = 'perfiles_proveedores';
const COL_PERFILES_PROFESIONALES = 'perfiles_profesionales';

export interface AuditorMetrics {
  pendingDocuments: number;
  auditedLast7Days: number;
  totalProveedores: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface NetworkUser {
  id: string;
  email: string;
  role: UserRole;
  nombre?: string;
  empresa?: string;
  createdAt?: Timestamp | null;
}

export interface UserBasic {
  id: string;
  email: string;
  role: UserRole;
  nombre?: string;
  empresa?: string;
  createdAt?: Timestamp | null;
}

export interface ProfileDetail {
  id: string;
  role: 'proveedor' | 'profesional';
  data: Record<string, unknown>;
}

export interface DocumentoConVencimiento {
  id: string;
  userId: string;
  tipoDocumento: string;
  estado: string;
  fileUrl?: string;
  fechaVencimiento: Timestamp | null;
  fechaSubida: Timestamp | null;
  updatedAt: Timestamp | null;
  /** Nombre o razón social del usuario (enriquecido desde users/perfiles). */
  nombre?: string;
  /** Email del usuario (enriquecido desde users). */
  email?: string;
}

export interface UserDisplayInfo {
  nombre: string;
  email: string;
}

/** Obtiene nombre/razón social y email para mostrar en la UI. */
export async function getUserDisplayInfo(userId: string): Promise<UserDisplayInfo> {
  if (!userId) return { nombre: '-', email: '-' };
  try {
    const userSnap = await getDoc(doc(db, COL_USERS, userId));
    const email = userSnap.exists() ? (userSnap.data()?.email as string) ?? '-' : '-';
    if (userSnap.exists()) {
      const data = userSnap.data();
      const nombre = (data?.nombre ?? data?.displayName ?? data?.empresa ?? '') as string;
      if (nombre) return { nombre, email };
    }
    const provSnap = await getDoc(doc(db, COL_PERFILES_PROVEEDORES, userId));
    const profSnap = await getDoc(doc(db, COL_PERFILES_PROFESIONALES, userId));
    if (provSnap.exists()) {
      const d = provSnap.data();
      const nombre = (d?.razonSocial ?? d?.empresa ?? d?.nombre ?? 'Proveedor') as string;
      return { nombre: nombre || 'Proveedor', email };
    }
    if (profSnap.exists()) {
      const d = profSnap.data();
      const nombre = (d?.nombre ?? 'Profesional') as string;
      return { nombre: nombre || 'Profesional', email };
    }
    return { nombre: userId.slice(0, 8) + '...', email };
  } catch {
    return { nombre: '-', email: '-' };
  }
}

/** Métricas principales para el panel del auditor. */
export async function getDashboardMetrics(): Promise<AuditorMetrics> {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const documentosSnap = await getDocs(collection(db, COL_DOCUMENTOS));
  let pendingDocuments = 0;
  let auditedLast7Days = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  documentosSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const estado = data.estado as string;
    const ts: Timestamp | undefined = (data.fechaSubida as Timestamp) ?? (data.updatedAt as Timestamp);
    const millis = ts?.toMillis?.() ?? 0;

    if (estado === 'pendiente') pendingDocuments += 1;
    if (estado === 'aprobado') approvedCount += 1;
    if (estado === 'rechazado') rejectedCount += 1;
    if ((estado === 'aprobado' || estado === 'rechazado') && millis >= sevenDaysAgo) {
      auditedLast7Days += 1;
    }
  });

  const proveedoresSnap = await getDocs(
    query(collection(db, COL_USERS), where('role', '==', 'proveedor'))
  );

  return {
    pendingDocuments,
    auditedLast7Days,
    totalProveedores: proveedoresSnap.size,
    approvedCount,
    rejectedCount,
  };
}

/** Lista usuarios proveedores y profesionales para el directorio. */
export async function getNetworkUsers(): Promise<NetworkUser[]> {
  const snap = await getDocs(
    query(collection(db, COL_USERS), where('role', 'in', ['proveedor', 'profesional']))
  );

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      email: data.email ?? '',
      role: data.role as UserRole,
      nombre: data.nombre ?? data.displayName ?? '',
      empresa: data.empresa ?? '',
      createdAt: data.createdAt ?? null,
    };
  });
}

/** Obtiene un usuario por id. */
export async function getUserById(userId: string): Promise<UserBasic | null> {
  const snap = await getDoc(doc(db, COL_USERS, userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    email: data.email ?? '',
    role: data.role as UserRole,
    nombre: data.nombre ?? data.displayName ?? '',
    empresa: data.empresa ?? '',
    createdAt: data.createdAt ?? null,
  };
}

/** Obtiene el perfil detallado del usuario (proveedor/profesional). */
export async function getProfileDetail(userId: string, role: 'proveedor' | 'profesional'): Promise<ProfileDetail | null> {
  const col = role === 'proveedor' ? COL_PERFILES_PROVEEDORES : COL_PERFILES_PROFESIONALES;
  const snap = await getDoc(doc(db, col, userId));
  if (!snap.exists()) return null;
  return { id: snap.id, role, data: snap.data() };
}

/** Documentos de un usuario (usa owner_uid o userId como fallback). */
export async function getDocumentsByUser(userId: string) {
  const q = query(
    collection(db, COL_DOCUMENTOS),
    where('userId', '==', userId)
  );
  const alt = query(
    collection(db, COL_DOCUMENTOS),
    where('owner_uid', '==', userId)
  );

  const [primarySnap, altSnap] = await Promise.all([getDocs(q), getDocs(alt)]);
  const docs = [...primarySnap.docs, ...altSnap.docs];

  const seen = new Set<string>();
  return docs
    .filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    })
    .map((d) => ({ id: d.id, ...d.data() }));
}

/** Documentos aprobados con fecha de vencimiento. Incluye nombre y email del usuario. */
export async function getApprovedDocumentsWithExpiry(): Promise<DocumentoConVencimiento[]> {
  const snap = await getDocs(query(collection(db, COL_DOCUMENTOS), where('estado', '==', 'aprobado')));

  const docs = snap.docs
    .map((d) => {
      const data = d.data();
      const fechaVencimiento = (data.fechaVencimiento as Timestamp) ?? null;
      if (!fechaVencimiento) return null;
      const userId = (data.userId as string) ?? (data.owner_uid as string) ?? '';
      return {
        id: d.id,
        userId,
        tipoDocumento: data.tipoDocumento ?? '',
        estado: data.estado ?? 'aprobado',
        fileUrl: data.fileUrl,
        fechaVencimiento,
        fechaSubida: (data.fechaSubida as Timestamp) ?? null,
        updatedAt: (data.updatedAt as Timestamp) ?? null,
      } as DocumentoConVencimiento;
    })
    .filter(Boolean) as DocumentoConVencimiento[];

  const userIds = [...new Set(docs.map((d) => d.userId).filter(Boolean))];
  const userMap = new Map<string, UserDisplayInfo>();
  await Promise.all(
    userIds.map(async (uid) => {
      userMap.set(uid, await getUserDisplayInfo(uid));
    })
  );

  return docs.map((d) => ({
    ...d,
    nombre: userMap.get(d.userId)?.nombre ?? '-',
    email: userMap.get(d.userId)?.email ?? '-',
  }));
}

/** Cambia el estado de un documento (incluye `vencido`). */
export async function updateDocumentEstado(
  docId: string,
  estado: 'aprobado' | 'rechazado' | 'vencido',
  extra?: { feedbackAuditor?: string }
): Promise<void> {
  const docRef = doc(db, COL_DOCUMENTOS, docId);
  const payload: Record<string, unknown> = {
    estado,
    updatedAt: serverTimestamp(),
  };
  if (extra?.feedbackAuditor !== undefined) {
    payload.feedbackAuditor = extra.feedbackAuditor;
  }
  await setDoc(docRef, payload, { merge: true });
}
