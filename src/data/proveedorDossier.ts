import type { EstadoDocumento } from '../types';

export interface DocumentoLegalProveedor {
  id: string;
  nombre: string;
  estado: EstadoDocumento;
  vencimiento: string;
}

export interface ProveedorDossierData {
  perfilId: string;
  cuit?: string;
  tamanoEmpresa: string;
  experienciaMinera: boolean;
  certificaciones: string[];
  documentosLegales: DocumentoLegalProveedor[];
}

const formatVencimiento = (date: Date) =>
  date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const DOC_LABELS: Record<string, string> = {
  afip: 'Constancia AFIP',
  art: 'Certificado ART',
  seguro: 'Pólizas de Seguro',
  mipyme: 'Certificado MiPyME',
  libre_deuda: 'Certificado de Libre Deuda',
};

const VENCIMIENTOS_BASE: Record<string, Date> = {
  afip: new Date(2026, 7, 15),
  art: new Date(2026, 5, 30),
  seguro: new Date(2026, 8, 1),
  mipyme: new Date(2026, 3, 20),
  libre_deuda: new Date(2026, 6, 10),
};

/** Mapeo perfilId -> datos extendidos para dossier proveedor */
export const PROVEEDOR_DOSSIER_MAP: Record<string, Partial<ProveedorDossierData>> = {
  '1': {
    cuit: '30-71234567-8',
    tamanoEmpresa: '11-50 Empleados',
    experienciaMinera: true,
    certificaciones: ['ISO 9001'],
  },
  '2': {
    cuit: '27-12345678-9',
    tamanoEmpresa: '1-10 Empleados',
    experienciaMinera: true,
    certificaciones: ['ISO 9001', 'ISO 14001'],
  },
};

const DEFAULT: Omit<ProveedorDossierData, 'perfilId' | 'documentosLegales'> = {
  tamanoEmpresa: '11-50 Empleados',
  experienciaMinera: true,
  certificaciones: ['ISO 9001'],
};

function buildDocumentosLegales(
  semaforo: Record<string, EstadoDocumento | undefined>
): DocumentoLegalProveedor[] {
  const keys = ['afip', 'art', 'seguro', 'mipyme', 'libre_deuda'] as const;
  return keys.map((key) => ({
    id: key,
    nombre: DOC_LABELS[key] || key,
    estado: semaforo[key] ?? 'pendiente',
    vencimiento: formatVencimiento(VENCIMIENTOS_BASE[key] || new Date(2026, 6, 1)),
  }));
}

export function getDossierProveedor(
  perfilId: string,
  semaforo: Record<string, EstadoDocumento | undefined>
): ProveedorDossierData {
  const custom = PROVEEDOR_DOSSIER_MAP[perfilId];
  const base = { ...DEFAULT, ...custom };
  return {
    perfilId,
    ...base,
    documentosLegales: buildDocumentosLegales(semaforo),
  };
}
