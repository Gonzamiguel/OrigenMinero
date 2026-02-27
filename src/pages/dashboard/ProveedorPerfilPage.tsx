import { useState, useMemo } from 'react';
import { Building2, HardHat, Award, Scale } from 'lucide-react';
import { TabDatosCorporativos, type DatosCorporativosForm } from './proveedor/TabDatosCorporativos';
import { TabCapacidadOperativa, type CapacidadOperativaForm } from './proveedor/TabCapacidadOperativa';
import { TabCertificacionesCalidad, type CertificacionesCalidadForm } from './proveedor/TabCertificacionesCalidad';
import { TabComplianceLegal } from './proveedor/TabComplianceLegal';
import { DOCUMENTOS_PROVEEDOR } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import type { TipoDocumento } from '../../types';

const TABS = [
  { id: 'corporativos', label: 'Datos Corporativos', icon: Building2 },
  { id: 'operativa', label: 'Capacidad Operativa', icon: HardHat },
  { id: 'certificaciones', label: 'Certificaciones y Calidad', icon: Award },
  { id: 'compliance', label: 'Compliance Legal', icon: Scale },
] as const;

type EstadoDoc = 'pendiente' | 'en_revision' | 'aprobado';

function semaforoToEstado(s: string | undefined): EstadoDoc {
  if (s === 'ok') return 'aprobado';
  if (s === 'en_revision') return 'en_revision';
  return 'pendiente';
}

function calcProgress(
  datos: DatosCorporativosForm,
  operativa: CapacidadOperativaForm,
  certificaciones: CertificacionesCalidadForm,
  docsAprobados: number,
  docsTotal: number
): number {
  let filled = 0;
  const total = 18;

  if (datos.razonSocial) filled++;
  if (datos.cuit) filled++;
  if (datos.personaContacto) filled++;
  if (datos.emailComercial) filled++;
  if (datos.telefono) filled++;
  if (datos.localidad) filled++;
  if (datos.tipoEntidad) filled++;
  if (operativa.rubroPrincipal) filled++;
  if (operativa.tamanoEmpresa) filled++;
  if (operativa.experienciaMineraPrevia !== null) filled++;
  if (operativa.descripcionFlota) filled++;
  if (certificaciones.normasISO.length > 0) filled++;
  if (certificaciones.registroProvincial) filled++;
  if (certificaciones.programaRSEActivo !== undefined) filled++;
  filled += (docsAprobados / Math.max(docsTotal, 1)) * 3;

  return Math.min(100, Math.round((filled / total) * 100));
}

export function ProveedorPerfilPage() {
  const { perfiles, cargarDocumento, addToast } = useApp();
  const perfilActual = perfiles.find((p) => p.tipo === 'proveedor' && p.id === '1') || perfiles.find((p) => p.tipo === 'proveedor') || perfiles[0];

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('corporativos');
  const [datos, setDatos] = useState<DatosCorporativosForm>(() => ({
    razonSocial: perfilActual?.empresa || '',
    cuit: '',
    personaContacto: perfilActual?.nombre || '',
    emailComercial: perfilActual?.email || '',
    telefono: perfilActual?.telefono || '',
    localidad: perfilActual?.localidad || '',
    tipoEntidad: '',
  }));
  const [operativa, setOperativa] = useState<CapacidadOperativaForm>(() => ({
    rubroPrincipal: perfilActual?.rubro || '',
    tamanoEmpresa: '',
    experienciaMineraPrevia: null,
    descripcionFlota: perfilActual?.descripcion || '',
  }));
  const [certificaciones, setCertificaciones] = useState<CertificacionesCalidadForm>({
    normasISO: [],
    registroProvincial: false,
    programaRSEActivo: false,
  });

  const documentos = useMemo(() => {
    const semaforo = perfilActual?.semaforo || {};
    return DOCUMENTOS_PROVEEDOR.map((d) => ({
      id: d.id,
      label: d.label,
      estado: semaforoToEstado(semaforo[d.id as TipoDocumento]),
      tipoDocumento: d.id as TipoDocumento,
    }));
  }, [perfilActual?.semaforo]);

  const docsAprobados = documentos.filter((d) => d.estado === 'aprobado').length;
  const progress = useMemo(
    () => calcProgress(datos, operativa, certificaciones, docsAprobados, documentos.length),
    [datos, operativa, certificaciones, docsAprobados, documentos.length]
  );

  const handleGuardar = () => {
    addToast('Perfil corporativo guardado correctamente.');
  };

  const handleFileSelect = (tipoDocumento: TipoDocumento, file: File) => {
    if (!perfilActual) return;
    cargarDocumento(perfilActual.id, tipoDocumento, file);
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Barra de progreso */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Perfil Corporativo: <strong>{progress}%</strong>
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
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
            {activeTab === 'corporativos' && (
              <TabDatosCorporativos
                form={datos}
                onChange={(field, value) => setDatos((p) => ({ ...p, [field]: value }))}
              />
            )}
            {activeTab === 'operativa' && (
              <TabCapacidadOperativa
                form={operativa}
                onChange={(field, value) => setOperativa((p) => ({ ...p, [field]: value }))}
              />
            )}
            {activeTab === 'certificaciones' && (
              <TabCertificacionesCalidad
                form={certificaciones}
                onChange={(field, value) => setCertificaciones((p) => ({ ...p, [field]: value }))}
              />
            )}
            {activeTab === 'compliance' && (
              <TabComplianceLegal
                documentos={documentos}
                onFileSelect={handleFileSelect}
              />
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
