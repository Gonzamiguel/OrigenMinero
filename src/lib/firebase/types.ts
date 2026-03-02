import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'auditor' | 'minera' | 'proveedor' | 'profesional';

export interface UserDocument {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  nombre: string;
  empresa?: string;
  rubro?: string;
  oficio?: string;
  localidad: string;
  email?: string;
  telefono?: string;
  descripcion?: string;
  /** Campos específicos para perfil profesional (persona física) */
  cuil?: string;
  fechaNacimiento?: string;
  domicilio?: string;
  experienciaMineria?: string;
  diagramaRoster?: string;
  pernocteCampamento?: boolean;
  updatedAt: Timestamp;
}

export type TipoDocumentoCompliance = 'afip' | 'art' | 'seguro' | 'mipyme' | 'libre_deuda' | 'residencia';

export interface ComplianceDocument {
  id?: string;
  owner_uid: string;
  tipoDocumento: TipoDocumentoCompliance;
  fileUrl: string;
  fileName: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaVencimiento: Timestamp | null;
  updatedAt: Timestamp;
}
