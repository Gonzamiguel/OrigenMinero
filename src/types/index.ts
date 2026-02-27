export type TipoPerfil = 'proveedor' | 'profesional';

export type EstadoDocumento = 'ok' | 'pendiente' | 'vencido' | 'en_revision';

export type EstadoSello = 'validado' | 'pendiente' | 'rechazado';

export type Genero = 'masculino' | 'femenino' | 'otro';

export interface Perfil {
  id: string;
  tipo: TipoPerfil;
  nombre: string;
  empresa?: string;
  rubro?: string;
  oficio?: string;
  genero?: Genero;
  localidad: string;
  foto?: string;
  descripcion: string;
  selloValidado: boolean;
  selloSustentable: boolean;
  semaforo: {
    afip: EstadoDocumento;
    art: EstadoDocumento;
    seguro: EstadoDocumento;
    residencia?: EstadoDocumento;
    mipyme?: EstadoDocumento;
    libre_deuda?: EstadoDocumento;
  };
  telefono?: string;
  email?: string;
}

export interface ProyectoRSE {
  id: string;
  nombre: string;
  localidad: string;
  descripcion: string;
  fechaInicio: string;
  estado: 'activo' | 'completado';
  montoInvertido?: number;
}

export interface Licitacion {
  id: string;
  titulo: string;
  descripcion: string;
  localidad: string;
  fechaCierre: string;
  postulantes: string[];
}

export interface PerfilAuditoria {
  id: string;
  nombre: string;
  empresa?: string;
  localidad: string;
  estado: EstadoSello;
  tipoSello: 'local' | 'sustentable';
}

export type TipoDocumento = keyof Perfil['semaforo'];

export interface DocumentoAuditoria {
  id: string;
  historialId: string;
  perfilId: string;
  tipoDocumento: TipoDocumento;
  nombrePerfil: string;
  empresa?: string;
  localidad: string;
  fechaCarga: string;
}

export type EstadoHistorialDocumento = 'en_revision' | 'aprobado' | 'rechazado';

export type TipoDocumentoHistorial = TipoDocumento | 'cv';

export interface HistorialDocumento {
  id: string;
  perfilId: string;
  tipoDocumento: TipoDocumentoHistorial;
  nombreArchivo: string;
  fechaCarga: string;
  estado: EstadoHistorialDocumento;
  fechaResolucion?: string;
}
