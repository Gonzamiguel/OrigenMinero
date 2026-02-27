import { useRef } from 'react';
import { Upload } from 'lucide-react';
import type { TipoDocumento } from '../../../types';

type EstadoDoc = 'pendiente' | 'en_revision' | 'aprobado';

interface DocumentoCompliance {
  id: string;
  label: string;
  estado: EstadoDoc;
  tipoDocumento: TipoDocumento;
}

interface TabComplianceLegalProps {
  documentos: DocumentoCompliance[];
  onFileSelect: (tipoDocumento: TipoDocumento, file: File) => void;
}

function DropzoneCompliance({
  label,
  estado,
  onFileSelect,
}: {
  label: string;
  estado: EstadoDoc;
  onFileSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const estadoBadge = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    en_revision: 'bg-amber-100 text-amber-700 border-amber-200',
    aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const estadoTexto = {
    pendiente: 'Pendiente',
    en_revision: 'En Revisión',
    aprobado: 'Aprobado',
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            onFileSelect(f);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-amber-400 transition cursor-pointer bg-slate-50/50"
      >
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-xs text-slate-500 mt-1">Arrastrá o hacé clic para subir PDF</p>
      </div>
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${estadoBadge[estado]}`}>
        {estadoTexto[estado]}
      </span>
    </div>
  );
}

export function TabComplianceLegal({ documentos, onFileSelect }: TabComplianceLegalProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {documentos.map((doc) => (
        <DropzoneCompliance
          key={doc.id}
          label={doc.label}
          estado={doc.estado}
          onFileSelect={(file) => onFileSelect(doc.tipoDocumento, file)}
        />
      ))}
    </div>
  );
}
