import { useState, useMemo, useEffect } from 'react';
import { Building2, HardHat, Award, Scale, Loader2, Leaf } from 'lucide-react';
import { TabDatosCorporativos, type DatosCorporativosForm } from './proveedor/TabDatosCorporativos';
import { TabCapacidadOperativa, type CapacidadOperativaForm } from './proveedor/TabCapacidadOperativa';
import { TabCertificacionesCalidad, type CertificacionesCalidadForm } from './proveedor/TabCertificacionesCalidad';
import { TabComplianceLegal } from './proveedor/TabComplianceLegal';
import { ProveedorESG } from './proveedor/ProveedorESG';
import { DOCUMENTOS_PROVEEDOR } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { getProveedorProfile, createOrUpdateProfile } from '../../lib/firebase/db';
import type { TipoDocumento } from '../../types';

const TABS = [
  { id: 'corporativos', label: 'Datos Corporativos', icon: Building2 },
  { id: 'operativa', label: 'Capacidad Operativa', icon: HardHat },
  { id: 'certificaciones', label: 'Certificaciones y Calidad', icon: Award },
  { id: 'compliance', label: 'Compliance Legal', icon: Scale },
  { id: 'sustentabilidad', label: 'Impacto y RSE', icon: Leaf },
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
  const { perfiles, addToast, refreshPerfiles } = useApp();
  const { user } = useAuth();
  const uid = user?.uid ?? '';
  const perfilActual = perfiles.find((p) => p.tipo === 'proveedor' && p.id === uid) || perfiles.find((p) => p.tipo === 'proveedor');

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('corporativos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datos, setDatos] = useState<DatosCorporativosForm>({
    razonSocial: '',
    cuit: '',
    personaContacto: '',
    emailComercial: '',
    telefono: '',
    localidad: '',
    tipoEntidad: '',
  });
  const [operativa, setOperativa] = useState<CapacidadOperativaForm>({
    rubroPrincipal: '',
    tamanoEmpresa: '',
    experienciaMineraPrevia: null,
    descripcionFlota: '',
  });
  const [certificaciones, setCertificaciones] = useState<CertificacionesCalidadForm>({
    normasISO: [],
    registroProvincial: false,
    programaRSEActivo: false,
  });

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    getProveedorProfile(uid)
      .then((p) => {
        if (cancelled || !p) return;
        setDatos({
          razonSocial: (p.razonSocial as string) ?? (p.empresa as string) ?? '',
          cuit: (p.cuit as string) ?? '',
          personaContacto: (p.personaContacto as string) ?? (p.nombre as string) ?? '',
          emailComercial: (p.emailComercial as string) ?? (p.email as string) ?? '',
          telefono: (p.telefono as string) ?? '',
          localidad: (p.localidad as string) ?? '',
          tipoEntidad: (p.tipoEntidad as string) ?? '',
        });
        setOperativa({
          rubroPrincipal: (p.rubroPrincipal as string) ?? (p.rubro as string) ?? '',
          tamanoEmpresa: (p.tamanoEmpresa as string) ?? '',
          experienciaMineraPrevia: (p.experienciaMineraPrevia as boolean | null) ?? null,
          descripcionFlota: (p.descripcionFlota as string) ?? (p.descripcion as string) ?? '',
        });
        setCertificaciones({
          normasISO: (p.normasISO as string[]) ?? [],
          registroProvincial: (p.registroProvincial as boolean) ?? false,
          programaRSEActivo: (p.programaRSEActivo as boolean) ?? false,
        });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const documentos = useMemo(() => {
    const semaforo = (perfilActual?.semaforo || {}) as Record<string, string | undefined>;
    return DOCUMENTOS_PROVEEDOR.map((d) => ({
      id: d.id,
      label: d.label,
      estado: semaforoToEstado(semaforo[d.id]),
      tipoDocumento: d.id as TipoDocumento,
    }));
  }, [perfilActual?.semaforo]);

  const docsAprobados = documentos.filter((d) => d.estado === 'aprobado').length;
  const docsTotal = documentos.length;
  const progress = useMemo(
    () => calcProgress(datos, operativa, certificaciones, docsAprobados, docsTotal),
    [datos, operativa, certificaciones, docsAprobados, docsTotal]
  );

  const handleGuardar = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      await createOrUpdateProfile(uid, 'proveedor', {
        nombre: datos.personaContacto,
        empresa: datos.razonSocial,
        localidad: datos.localidad,
        email: datos.emailComercial,
        telefono: datos.telefono,
        descripcion: operativa.descripcionFlota,
        rubro: operativa.rubroPrincipal,
        razonSocial: datos.razonSocial,
        cuit: datos.cuit,
        personaContacto: datos.personaContacto,
        emailComercial: datos.emailComercial,
        tipoEntidad: datos.tipoEntidad,
        tamanoEmpresa: operativa.tamanoEmpresa,
        experienciaMineraPrevia: operativa.experienciaMineraPrevia,
        descripcionFlota: operativa.descripcionFlota,
        normasISO: certificaciones.normasISO,
        registroProvincial: certificaciones.registroProvincial,
        programaRSEActivo: certificaciones.programaRSEActivo,
      });
      await refreshPerfiles();
      addToast('Perfil corporativo guardado correctamente.');
    } catch (err) {
      console.error(err);
      addToast('Error al guardar. Intentá nuevamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

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
            {activeTab === 'compliance' && <TabComplianceLegal />}
            {activeTab === 'sustentabilidad' && <ProveedorESG />}

            {activeTab !== 'sustentabilidad' && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
