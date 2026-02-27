import { useRef } from 'react';
import { Upload } from 'lucide-react';

interface DropzoneCVProps {
  perfilId: string;
  onCargar: (perfilId: string, file: File) => void;
}

export function DropzoneCV({ perfilId, onCargar }: DropzoneCVProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCargar(perfilId, file);
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-amber-400 transition cursor-pointer"
      >
        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">Subir CV (PDF)</p>
        <p className="text-xs text-slate-500 mt-1">Arrastrá aquí o subí tu currículum</p>
      </div>
    </>
  );
}
