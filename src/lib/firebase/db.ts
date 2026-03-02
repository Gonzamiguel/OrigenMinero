import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import type { UserRole } from './types';
import type { UserProfile } from './types';
import type { ComplianceDocument, TipoDocumentoCompliance } from './types';

const COL_PERFILES_PROVEEDORES = 'perfiles_proveedores';
const COL_PERFILES_PROFESIONALES = 'perfiles_profesionales';
const COL_DOCUMENTOS = 'documentos';

/** Guarda o actualiza el perfil según el rol. */
export async function createOrUpdateProfile(
  uid: string,
  role: UserRole,
  data: Partial<UserProfile>
): Promise<void> {
  try {
    const col = role === 'proveedor' ? COL_PERFILES_PROVEEDORES : COL_PERFILES_PROFESIONALES;
    const docRef = doc(db, col, uid);
    const payload = {
      ...data,
      uid,
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.error('Error createOrUpdateProfile:', err);
    throw err;
  }
}

/** Sube un PDF a Storage y crea el registro en la colección documentos. */
export async function uploadComplianceDocument(
  uid: string,
  file: File,
  tipoDocumento: TipoDocumentoCompliance
): Promise<string> {
  try {
    const ext = file.name.split('.').pop() || 'pdf';
    const filename = `${tipoDocumento}_${Date.now()}.${ext}`;
    const storageRef = ref(storage, `documentos/${uid}/${filename}`);

    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    const docRef = doc(collection(db, COL_DOCUMENTOS));
    await setDoc(docRef, {
      owner_uid: uid,
      tipoDocumento,
      fileUrl,
      fileName: file.name,
      estado: 'pendiente',
      fechaVencimiento: null,
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (err) {
    console.error('Error uploadComplianceDocument:', err);
    throw err;
  }
}

/** Obtiene el perfil profesional desde Firestore. */
export async function getProfesionalProfile(uid: string): Promise<Partial<UserProfile> | null> {
  try {
    const docRef = doc(db, COL_PERFILES_PROFESIONALES, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data() as Partial<UserProfile>;
    return null;
  } catch (err) {
    console.error('Error getProfesionalProfile:', err);
    throw err;
  }
}

/** Obtiene los documentos del usuario (dashboard proveedor). */
export async function getDocumentsByUserId(uid: string): Promise<ComplianceDocument[]> {
  try {
    const q = query(
      collection(db, COL_DOCUMENTOS),
      where('owner_uid', '==', uid)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        owner_uid: data.owner_uid,
        tipoDocumento: data.tipoDocumento,
        fileUrl: data.fileUrl,
        fileName: data.fileName ?? '',
        estado: data.estado ?? 'pendiente',
        fechaVencimiento: data.fechaVencimiento ?? null,
        updatedAt: data.updatedAt,
      } as ComplianceDocument;
    });
    return docs.sort((a, b) => {
      const aTs = a.updatedAt?.toMillis?.() ?? 0;
      const bTs = b.updatedAt?.toMillis?.() ?? 0;
      return bTs - aTs;
    });
  } catch (err) {
    console.error('Error getDocumentsByUserId:', err);
    throw err;
  }
}

/** Obtiene documentos pendientes (cola de trabajo para auditor). */
export async function getPendingDocuments(): Promise<ComplianceDocument[]> {
  try {
    const q = query(
      collection(db, COL_DOCUMENTOS),
      where('estado', '==', 'pendiente')
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        owner_uid: data.owner_uid,
        tipoDocumento: data.tipoDocumento,
        fileUrl: data.fileUrl,
        fileName: data.fileName ?? '',
        estado: data.estado ?? 'pendiente',
        fechaVencimiento: data.fechaVencimiento ?? null,
        updatedAt: data.updatedAt,
      } as ComplianceDocument;
    });
    return docs.sort((a, b) => {
      const aTs = a.updatedAt?.toMillis?.() ?? 0;
      const bTs = b.updatedAt?.toMillis?.() ?? 0;
      return aTs - bTs;
    });
  } catch (err) {
    console.error('Error getPendingDocuments:', err);
    throw err;
  }
}
