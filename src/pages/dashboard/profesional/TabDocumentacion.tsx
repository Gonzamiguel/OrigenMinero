import { useRef } from 'react';
import { Upload } from 'lucide-react';

export type EstadoDoc = 'pendiente' | 'en_revision' | 'aprobado';

export interface DocumentoEstado {
  id: string;
  label: string;
  estado: EstadoDoc;
}

interface DropzoneConSemaforoProps {
  label: string;
  estado: EstadoDoc;
  onFileSelect?: (file: File) => void;
}

function DropzoneConSemaforo({ label, estado, onFileSelect }: DropzoneConSemaforoProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  const estadoBadge = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    en_revision: 'bg-amber-100 text-amber-700 border-amber-200',
    aprobado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const estadoTexto = {
    pendiente: 'Pendiente',
    en_revision: 'Pendiente de validación',
    aprobado: 'Aprobado',
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf,image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-amber-400 transition cursor-pointer"
      >
        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-xs text-slate-500 mt-1">Arrastrá o hacé clic para subir</p>
      </div>
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${estadoBadge[estado]}`}>
        {estadoTexto[estado]}
      </span>
    </div>
  );
}

interface TabDocumentacionProps {
  documentos: DocumentoEstado[];
  onFileSelect?: (docId: string, file: File) => void;
}

export function TabDocumentacion({ documentos, onFileSelect }: TabDocumentacionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {documentos.map((doc) => (
        <DropzoneConSemaforo
          key={doc.id}
          label={doc.label}
          estado={doc.estado}
          onFileSelect={onFileSelect ? (f) => onFileSelect(doc.id, f) : undefined}
        />
      ))}
    </div>
  );
}
