import JSZip from 'jszip';
import type { Perfil } from '../types';
import type { HistorialDocumento } from '../types';

const DOC_LABELS: Record<string, string> = {
  afip: 'Constancia AFIP',
  art: 'ART',
  seguro: 'Seguro',
  residencia: 'Constancia Residencia',
  cv: 'CV',
  mipyme: 'Certificado MiPyME',
  libre_deuda: 'Certificado de Libre Deuda',
};

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildResumenTxt(perfil: Perfil): string {
  const lines: (string | null)[] = [
    '═══════════════════════════════════════════════════════════',
    'LEGAJO - ORIGEN MINERO',
    '═══════════════════════════════════════════════════════════',
    '',
    `Tipo: ${perfil.tipo === 'proveedor' ? 'Proveedor' : 'Profesional'}`,
    `Nombre: ${perfil.nombre}`,
    perfil.empresa ? `Empresa: ${perfil.empresa}` : null,
    perfil.rubro ? `Rubro: ${perfil.rubro}` : perfil.oficio ? `Oficio: ${perfil.oficio}` : null,
    `Localidad: ${perfil.localidad}`,
    '',
    '--- Descripción ---',
    perfil.descripcion,
    '',
    '--- Sellos ---',
    `Sello Local: ${perfil.selloValidado ? 'Validado' : 'Pendiente'}`,
    `Sello Sustentable: ${perfil.selloSustentable ? 'Validado' : 'Pendiente'}`,
    '',
    '--- Estado de Documentos ---',
    ...Object.entries(perfil.semaforo).map(
      ([key, estado]) => `  ${DOC_LABELS[key] || key}: ${estado === 'ok' ? 'Aprobado' : estado === 'en_revision' ? 'En revisión' : estado === 'vencido' ? 'Vencido' : 'Pendiente'}`
    ),
    '',
    '--- Contacto ---',
    perfil.telefono ? `Teléfono: ${perfil.telefono}` : null,
    perfil.email ? `Email: ${perfil.email}` : null,
    '',
    '═══════════════════════════════════════════════════════════',
    `Generado: ${formatFecha(new Date().toISOString())}`,
    '═══════════════════════════════════════════════════════════',
  ];
  return lines.filter((x): x is string => x != null).join('\n');
}

function buildDocumentosTxt(historial: HistorialDocumento[]): string {
  if (historial.length === 0) {
    return 'No hay documentos cargados en el historial.';
  }
  const lines: string[] = [
    'DOCUMENTOS DEL LEGAJO',
    '─────────────────────',
    '',
    ...historial
      .filter((h) => h.estado === 'aprobado')
      .map(
        (h) =>
          `• ${DOC_LABELS[h.tipoDocumento] || h.tipoDocumento}: ${h.nombreArchivo} (aprobado ${h.fechaResolucion ? formatFecha(h.fechaResolucion) : '-'})`
      ),
  ];
  return lines.join('\n');
}

/**
 * Genera y descarga un archivo ZIP con el legajo del perfil.
 * Incluye resumen y lista de documentos aprobados.
 */
export async function descargarLegajo(
  perfil: Perfil,
  historialFiltrado?: HistorialDocumento[]
): Promise<void> {
  const zip = new JSZip();
  const nombreArchivo = (perfil.empresa || perfil.nombre).replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');

  zip.file('resumen.txt', buildResumenTxt(perfil));
  zip.file(
    'documentos.txt',
    buildDocumentosTxt(historialFiltrado || [])
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `legajo-${nombreArchivo}-${perfil.id}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
