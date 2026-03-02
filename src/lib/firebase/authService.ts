import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/** Roles permitidos SOLO en registro público. minera, auditor, admin se crean manualmente. */
export type PublicRole = 'proveedor' | 'profesional';

function isPublicRole(role: string): role is PublicRole {
  return role === 'proveedor' || role === 'profesional';
}

/**
 * Registra un usuario. Solo permite roles 'proveedor' o 'profesional'.
 * Los roles minera, auditor, admin están bloqueados del frontend.
 */
export async function registerUser(
  email: string,
  password: string,
  role: PublicRole,
  nombre: string
): Promise<string> {
  if (!isPublicRole(role)) {
    throw new Error('Rol no permitido en registro público. Solo proveedor o profesional.');
  }
  if (!nombre?.trim()) {
    throw new Error('El nombre o razón social es obligatorio.');
  }

  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    email: user.email ?? email,
    role,
    nombre: nombre.trim(),
    createdAt: serverTimestamp(),
  });

  return user.uid;
}

export async function loginUser(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Mensajes de error amigables para el usuario */
export function getAuthErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
    return 'Contraseña incorrecta.';
  }
  if (msg.includes('auth/user-not-found')) {
    return 'No existe una cuenta con este correo.';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'El correo ya existe. Use "Ingresar" para acceder.';
  }
  if (msg.includes('auth/weak-password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('auth/invalid-email')) {
    return 'Correo electrónico no válido.';
  }
  if (msg.includes('auth/too-many-requests')) {
    return 'Demasiados intentos. Espere unos minutos e intente de nuevo.';
  }
  return 'Ha ocurrido un error. Intente de nuevo.';
}
