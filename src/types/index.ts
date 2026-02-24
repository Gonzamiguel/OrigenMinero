export type TipoPerfil = 'proveedor' | 'profesional';

export type EstadoDocumento = 'ok' | 'pendiente' | 'vencido' | 'en_revision';

export type EstadoSello = 'validado' | 'pendiente' | 'rechazado';

export interface Perfil {
  id: string;
  tipo: TipoPerfil;
  nombre: string;
  empresa?: string;
  rubro?: string;
  oficio?: string;
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
