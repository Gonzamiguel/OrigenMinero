import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './config';

const COL_USERS = 'users';

/** Obtiene los IDs de contratistas vinculados a la nómina de la empresa. */
export async function getContratistasVinculados(empresaUid: string): Promise<string[]> {
  try {
    const userRef = doc(db, COL_USERS, empresaUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return [];
    const data = snap.data();
    const arr = data?.contratistasVinculados;
    return Array.isArray(arr) ? arr.filter((id): id is string => typeof id === 'string') : [];
  } catch (err) {
    console.error('Error getContratistasVinculados:', err);
    return [];
  }
}

/** Agrega o quita un contratista de la nómina. Retorna true si se agregó, false si se quitó. */
export async function toggleContratistaNomina(
  empresaUid: string,
  contratistaId: string
): Promise<{ added: boolean }> {
  const userRef = doc(db, COL_USERS, empresaUid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('Usuario empresa no encontrado');
  }
  const data = snap.data();
  const arr = (data?.contratistasVinculados as string[] | undefined) ?? [];
  const exists = arr.includes(contratistaId);

  if (exists) {
    await updateDoc(userRef, {
      contratistasVinculados: arrayRemove(contratistaId),
    });
    return { added: false };
  } else {
    await updateDoc(userRef, {
      contratistasVinculados: arrayUnion(contratistaId),
    });
    return { added: true };
  }
}
