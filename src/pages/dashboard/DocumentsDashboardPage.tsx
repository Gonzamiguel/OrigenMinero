import { useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadDocument } from '../../lib/firebase/documentService';

const TIPOS_DOCUMENTO = [
  { value: 'Constancia AFIP', label: 'Constancia AFIP' },
  { value: 'DNI', label: 'DNI' },
  { value: 'ART', label: 'ART' },
  { value: 'Seguro RC', label: 'Seguro RC' },
  { value: 'Certificado MiPyME', label: 'Certificado MiPyME' },
  { value: 'Certificado de Libre Deuda', label: 'Certificado de Libre Deuda' },
  { value: 'Otro', label: 'Otro' },
];

export function DocumentsDashboardPage() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState(TIPOS_DOCUMENTO[0].value);

  const userId = user?.uid ?? '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !userId) return;
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);
      await uploadDocument(selectedFile, userId, tipoDocumento);
      setSelectedFile(null);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Subir documento</h1>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleUpload} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                Documento subido correctamente. Podés verlo en el Historial de archivos.
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de documento</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-blue-950 outline-none"
                >
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Archivo PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm file:font-medium hover:file:bg-slate-200"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir archivo
                  </>
                )}
              </button>
              {selectedFile && (
                <span className="text-sm text-slate-600">{selectedFile.name}</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
