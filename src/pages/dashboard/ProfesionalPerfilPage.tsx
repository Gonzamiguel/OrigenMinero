import { useState, useMemo } from 'react';
import { User, Settings, GraduationCap, FileText } from 'lucide-react';
import { TabDatosPersonales, type DatosPersonalesForm } from './profesional/TabDatosPersonales';
import { TabPerfilOperativo, type PerfilOperativoForm } from './profesional/TabPerfilOperativo';
import { TabCredencialesTecnicas, type CredencialesTecnicasForm } from './profesional/TabCredencialesTecnicas';
import { TabDocumentacion, type DocumentoEstado } from './profesional/TabDocumentacion';
import { useApp } from '../../context/AppContext';

const TABS = [
  { id: 'datos', label: 'Datos Personales', icon: User },
  { id: 'operativo', label: 'Perfil Operativo', icon: Settings },
  { id: 'credenciales', label: 'Credenciales Técnicas', icon: GraduationCap },
  { id: 'documentacion', label: 'Documentación', icon: FileText },
] as const;

const DOCUMENTOS_INICIALES: DocumentoEstado[] = [
  { id: 'dni', label: 'DNI (Frente y Dorso)', estado: 'pendiente' },
  { id: 'residencia', label: 'Certificado de Residencia', estado: 'pendiente' },
  { id: 'antecedentes', label: 'Certificado de Antecedentes Penales', estado: 'pendiente' },
  { id: 'cv', label: 'Curriculum Vitae (PDF)', estado: 'pendiente' },
];

const initialDatos: DatosPersonalesForm = {
  nombreCompleto: '',
  cuil: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  localidad: '',
};

const initialOperativo: PerfilOperativoForm = {
  situacionLaboral: '',
  diagramaRoster: '',
  pernocteCampamento: null,
  experienciaMineria: '',
};

const initialCredenciales: CredencialesTecnicasForm = {
  oficio: '',
  licenciaConducir: 'no',
  certificaciones: [],
  nivelEducacion: '',
};

function calcProgress(
  datos: DatosPersonalesForm,
  operativo: PerfilOperativoForm,
  credenciales: CredencialesTecnicasForm,
  documentos: DocumentoEstado[]
): number {
  let filled = 0;
  const total = 20;

  if (datos.nombreCompleto) filled++;
  if (datos.cuil) filled++;
  if (datos.fechaNacimiento) filled++;
  if (datos.telefono) filled++;
  if (datos.email) filled++;
  if (datos.localidad) filled++;
  if (operativo.situacionLaboral) filled++;
  if (operativo.diagramaRoster) filled++;
  if (operativo.pernocteCampamento !== null) filled++;
  if (operativo.experienciaMineria) filled++;
  if (credenciales.oficio) filled++;
  if (credenciales.licenciaConducir) filled++;
  if (credenciales.nivelEducacion) filled++;
  if (credenciales.certificaciones.length > 0) filled++;
  documentos.forEach((d) => {
    if (d.estado === 'aprobado') filled++;
    else if (d.estado === 'en_revision') filled += 0.5;
  });

  return Math.round((filled / total) * 100);
}

export function ProfesionalPerfilPage() {
  const { perfiles, addToast } = useApp();
  const perfilActual = perfiles.find((p) => p.tipo === 'profesional') || perfiles[0];

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('datos');
  const [datos, setDatos] = useState<DatosPersonalesForm>(() => ({
    ...initialDatos,
    nombreCompleto: perfilActual?.nombre || '',
    telefono: perfilActual?.telefono || '',
    email: perfilActual?.email || '',
    localidad: perfilActual?.localidad || '',
  }));
  const [operativo, setOperativo] = useState<PerfilOperativoForm>(initialOperativo);
  const [credenciales, setCredenciales] = useState<CredencialesTecnicasForm>(() => ({
    ...initialCredenciales,
    oficio: perfilActual?.oficio || '',
  }));
  const [documentos, setDocumentos] = useState<DocumentoEstado[]>(DOCUMENTOS_INICIALES);

  const progress = useMemo(
    () => calcProgress(datos, operativo, credenciales, documentos),
    [datos, operativo, credenciales, documentos]
  );

  const handleGuardar = () => {
    addToast('Perfil guardado correctamente.');
  };

  const handleFileSelect = (docId: string, _file: File) => {
    setDocumentos((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, estado: 'en_revision' as const } : d))
    );
    addToast('Documento cargado. Será validado por el equipo.');
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Barra de progreso */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Perfil completado: <strong>{progress}%</strong>
            </span>
            <div className="w-full max-w-xs ml-4 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100 ? 'bg-emerald-500' : 'bg-amber-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Completá tu perfil al 100% para aparecer en las búsquedas de las operadoras mineras.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'datos' && (
              <TabDatosPersonales
                form={datos}
                onChange={(field, value) => setDatos((p) => ({ ...p, [field]: value }))}
              />
            )}
            {activeTab === 'operativo' && (
              <TabPerfilOperativo
                form={operativo}
                onChange={(field, value) => setOperativo((p) => ({ ...p, [field]: value }))}
              />
            )}
            {activeTab === 'credenciales' && (
              <TabCredencialesTecnicas
                form={credenciales}
                onChange={(field, value) =>
                  setCredenciales((p) => ({ ...p, [field]: value }))
                }
              />
            )}
            {activeTab === 'documentacion' && (
              <TabDocumentacion documentos={documentos} onFileSelect={handleFileSelect} />
            )}

            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleGuardar}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500 transition"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
