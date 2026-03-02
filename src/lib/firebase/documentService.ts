import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, storage } from './config';

export type EstadoDocumento = 'pendiente' | 'aprobado' | 'rechazado';

export interface DocumentoCompliance {
  id: string;
  userId: string;
  tipoDocumento: string;
  fileUrl: string;
  nombreOriginal: string;
  estado: EstadoDocumento;
  fechaSubida: { toMillis: () => number } | null;
  fechaVencimiento: { toMillis: () => number } | null;
  feedbackAuditor: string;
}

/** Documento con nombre del emisor (para auditor). */
export interface DocumentoPendienteAuditor extends DocumentoCompliance {
  ownerName: string;
}

const COL_DOCUMENTOS = 'documentos';

/**
 * Sube un PDF a Storage y crea el registro en Firestore.
 */
export async function uploadDocument(
  file: File,
  userId: string,
  tipoDocumento: string
): Promise<string> {
  try {
    const storagePath = `documentos/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    const docRef = doc(collection(db, COL_DOCUMENTOS));
    await setDoc(docRef, {
      userId,
      tipoDocumento,
      fileUrl,
      nombreOriginal: file.name,
      estado: 'pendiente',
      fechaSubida: serverTimestamp(),
      fechaVencimiento: null,
      feedbackAuditor: '',
    });

    return docRef.id;
  } catch (err) {
    console.error('Error uploadDocument:', err);
    throw err;
  }
}

/**
 * Obtiene todos los documentos del usuario ordenados por fecha (más reciente primero).
 */
export async function getUserDocuments(userId: string): Promise<DocumentoCompliance[]> {
  try {
    const q = query(
      collection(db, COL_DOCUMENTOS),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        tipoDocumento: data.tipoDocumento ?? '',
        fileUrl: data.fileUrl ?? '',
        nombreOriginal: data.nombreOriginal ?? '',
        estado: (data.estado as EstadoDocumento) ?? 'pendiente',
        fechaSubida: data.fechaSubida ?? null,
        fechaVencimiento: data.fechaVencimiento ?? null,
        feedbackAuditor: data.feedbackAuditor ?? '',
      } as DocumentoCompliance;
    });
    return docs.sort((a, b) => {
      const aTs = a.fechaSubida?.toMillis?.() ?? 0;
      const bTs = b.fechaSubida?.toMillis?.() ?? 0;
      return bTs - aTs;
    });
  } catch (err) {
    console.error('Error getUserDocuments:', err);
    throw err;
  }
}

/**
 * Obtiene documentos pendientes para el auditor. Ordenados por fecha ascendente (más viejo primero).
 * Incluye el nombre del emisor desde users o perfiles.
 */
export async function getPendingDocumentsForAuditor(): Promise<DocumentoPendienteAuditor[]> {
  try {
    const q = query(
      collection(db, COL_DOCUMENTOS),
      where('estado', '==', 'pendiente')
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => {
      const data = d.data();
      const uid = data.userId ?? data.owner_uid ?? '';
      return {
        id: d.id,
        userId: uid,
        tipoDocumento: data.tipoDocumento ?? '',
        fileUrl: data.fileUrl ?? '',
        nombreOriginal: data.nombreOriginal ?? data.fileName ?? '',
        estado: (data.estado as EstadoDocumento) ?? 'pendiente',
        fechaSubida: data.fechaSubida ?? data.updatedAt ?? null,
        fechaVencimiento: data.fechaVencimiento ?? null,
        feedbackAuditor: data.feedbackAuditor ?? '',
        ownerName: '',
      } as DocumentoPendienteAuditor;
    });
    const sorted = docs.sort((a, b) => {
      const aTs = a.fechaSubida?.toMillis?.() ?? 0;
      const bTs = b.fechaSubida?.toMillis?.() ?? 0;
      return aTs - bTs;
    });
    for (const d of sorted) {
      if (d.userId) {
        try {
          const userSnap = await getDoc(doc(db, 'users', d.userId));
          if (userSnap.exists()) {
            d.ownerName = userSnap.data()?.nombre ?? userSnap.data()?.email ?? 'Usuario';
          } else {
            const provSnap = await getDoc(doc(db, 'perfiles_proveedores', d.userId));
            const profSnap = await getDoc(doc(db, 'perfiles_profesionales', d.userId));
            if (provSnap.exists()) d.ownerName = provSnap.data()?.nombre ?? provSnap.data()?.empresa ?? 'Proveedor';
            else if (profSnap.exists()) d.ownerName = profSnap.data()?.nombre ?? 'Profesional';
            else d.ownerName = 'Usuario';
          }
        } catch {
          d.ownerName = 'Usuario';
        }
      }
    }
    return sorted;
  } catch (err) {
    console.error('Error getPendingDocumentsForAuditor:', err);
    throw err;
  }
}

/**
 * Actualiza el estado de un documento (aprobado/rechazado).
 */
export async function updateDocumentStatus(
  docId: string,
  data: {
    estado: 'aprobado' | 'rechazado';
    fechaVencimiento?: Date;
    feedbackAuditor?: string;
  }
): Promise<void> {
  try {
    const docRef = doc(db, COL_DOCUMENTOS, docId);
    const payload: Record<string, unknown> = {
      estado: data.estado,
      updatedAt: serverTimestamp(),
    };
    if (data.fechaVencimiento) {
      payload.fechaVencimiento = Timestamp.fromDate(data.fechaVencimiento);
    }
    if (data.feedbackAuditor !== undefined) {
      payload.feedbackAuditor = data.feedbackAuditor;
    }
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.error('Error updateDocumentStatus:', err);
    throw err;
  }
}

/**
 * Obtiene documentos aprobados o rechazados (historial para auditor).
 */
export async function getCompletedDocumentsForAuditor(): Promise<DocumentoPendienteAuditor[]> {
  try {
    const q = query(
      collection(db, COL_DOCUMENTOS),
      where('estado', 'in', ['aprobado', 'rechazado'])
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => {
      const data = d.data();
      const uid = data.userId ?? data.owner_uid ?? '';
      return {
        id: d.id,
        userId: uid,
        tipoDocumento: data.tipoDocumento ?? '',
        fileUrl: data.fileUrl ?? '',
        nombreOriginal: data.nombreOriginal ?? data.fileName ?? '',
        estado: (data.estado as EstadoDocumento) ?? 'aprobado',
        fechaSubida: data.fechaSubida ?? data.updatedAt ?? null,
        fechaVencimiento: data.fechaVencimiento ?? null,
        feedbackAuditor: data.feedbackAuditor ?? '',
        ownerName: '',
      } as DocumentoPendienteAuditor;
    });
    const sorted = docs.sort((a, b) => {
      const aTs = a.fechaSubida?.toMillis?.() ?? 0;
      const bTs = b.fechaSubida?.toMillis?.() ?? 0;
      return bTs - aTs;
    });
    for (const d of sorted) {
      if (d.userId) {
        try {
          const userSnap = await getDoc(doc(db, 'users', d.userId));
          if (userSnap.exists()) {
            d.ownerName = userSnap.data()?.nombre ?? userSnap.data()?.email ?? 'Usuario';
          } else {
            const provSnap = await getDoc(doc(db, 'perfiles_proveedores', d.userId));
            const profSnap = await getDoc(doc(db, 'perfiles_profesionales', d.userId));
            if (provSnap.exists()) d.ownerName = provSnap.data()?.nombre ?? provSnap.data()?.empresa ?? 'Proveedor';
            else if (profSnap.exists()) d.ownerName = profSnap.data()?.nombre ?? 'Profesional';
            else d.ownerName = 'Usuario';
          }
        } catch {
          d.ownerName = 'Usuario';
        }
      }
    }
    return sorted;
  } catch (err) {
    console.error('Error getCompletedDocumentsForAuditor:', err);
    throw err;
  }
}
