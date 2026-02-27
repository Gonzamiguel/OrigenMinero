import type { EstadoDocumento } from '../types';

export interface DocumentoLegalDossier {
  id: string;
  nombre: string;
  estado: EstadoDocumento;
  vencimiento: string; // ISO o "DD/MM/YYYY"
}

export interface PerfilProfesionalDossier {
  perfilId: string;
  diagramaRoster: string;
  pernocteCampamento: boolean;
  experienciaMineria: string;
  nivelEducacion: string;
  licenciasConducir: string[];
  certificaciones: string[];
  documentosLegales: DocumentoLegalDossier[];
  ultimaValidacion: string;
}

const formatVencimiento = (date: Date) =>
  date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Datos extendidos para el dossier de profesional (vista Minera). Por defecto se usa cuando no hay datos específicos. */
const DEFAULT_DOSSIER: Omit<PerfilProfesionalDossier, 'perfilId' | 'documentosLegales'> = {
  diagramaRoster: 'Disponible 14x14',
  pernocteCampamento: true,
  experienciaMineria: '+5 Años en minería subterránea',
  nivelEducacion: 'Técnico Mecánico',
  licenciasConducir: ['Licencia E1', 'LINTI Cargas Peligrosas'],
  certificaciones: ['Trabajo en Altura', 'Manejo Defensivo', 'Primeros Auxilios'],
  ultimaValidacion: '24/02/2026',
};

function buildDocumentosLegales(
  semaforo: Record<string, EstadoDocumento | undefined>
): DocumentoLegalDossier[] {
  const labels: Record<string, string> = {
    afip: 'Constancia AFIP',
    art: 'ART',
    seguro: 'Seguro',
    residencia: 'Certificado de Residencia',
  };
  const vencimientosBase: Record<string, Date> = {
    afip: new Date(2026, 7, 15),
    art: new Date(2026, 5, 30),
    seguro: new Date(2026, 8, 1),
    residencia: new Date(2026, 6, 20),
  };
  return Object.entries(semaforo)
    .filter(([, v]) => v != null)
    .map(([key, estado]) => ({
      id: key,
      nombre: labels[key] || key,
      estado: estado!,
      vencimiento: formatVencimiento(vencimientosBase[key] || new Date(2026, 6, 1)),
    }));
}

/** Mapeo perfilId -> dossier extendido. Si no existe, se genera desde el perfil base. */
export const PERFIL_DOSSIER_MAP: Record<string, Partial<PerfilProfesionalDossier>> = {
  '3': {
    diagramaRoster: 'Disponible 14x14',
    pernocteCampamento: true,
    experienciaMineria: '+5 Años en minería subterránea',
    nivelEducacion: 'Técnico Mecánico',
    licenciasConducir: ['Licencia E1', 'LINTI Cargas Peligrosas'],
    certificaciones: ['Trabajo en Altura', 'Manejo Defensivo', 'Primeros Auxilios'],
    ultimaValidacion: '24/02/2026',
  },
  '4': {
    diagramaRoster: 'Disponible 8x6',
    pernocteCampamento: true,
    experienciaMineria: '+3 Años en minería a cielo abierto',
    nivelEducacion: 'Secundario Completo',
    licenciasConducir: ['Licencia E1', 'Licencia E2'],
    certificaciones: ['Manejo Defensivo', 'Primeros Auxilios'],
    ultimaValidacion: '20/02/2026',
  },
  '6': {
    diagramaRoster: 'Lunes a Viernes',
    pernocteCampamento: false,
    experienciaMineria: '+8 Años en minería subterránea',
    nivelEducacion: 'Técnico en Soldadura',
    licenciasConducir: [],
    certificaciones: ['Trabajo en Altura', 'Espacios Confinados', 'Primeros Auxilios'],
    ultimaValidacion: '22/02/2026',
  },
};

export function getDossierProfesional(
  perfilId: string,
  semaforo: Record<string, EstadoDocumento | undefined>
): PerfilProfesionalDossier {
  const custom = PERFIL_DOSSIER_MAP[perfilId];
  const base = { ...DEFAULT_DOSSIER, ...custom };
  return {
    perfilId,
    ...base,
    documentosLegales: buildDocumentosLegales(semaforo),
  };
}
