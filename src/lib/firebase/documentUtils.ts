import type { DocumentoCompliance } from './documentService';

/**
 * Agrupa documentos por tipoDocumento y retorna solo el más reciente de cada grupo.
 */
export function getLatestDocumentByType(docs: DocumentoCompliance[]): Map<string, DocumentoCompliance> {
  const byType = new Map<string, DocumentoCompliance>();
  for (const doc of docs) {
    const key = doc.tipoDocumento.trim();
    if (!key) continue;
    const existing = byType.get(key);
    const docTs = doc.fechaSubida?.toMillis?.() ?? 0;
    const existingTs = existing?.fechaSubida?.toMillis?.() ?? 0;
    if (!existing || docTs > existingTs) {
      byType.set(key, doc);
    }
  }
  return byType;
}
