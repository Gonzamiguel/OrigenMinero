import { useState, useMemo, useEffect } from 'react';
import { User, Settings, Scale, Loader2 } from 'lucide-react';
import { TabDatosPersonales, type DatosPersonalesForm } from './profesional/TabDatosPersonales';
import { TabPerfilOperativo, type PerfilOperativoForm } from './profesional/TabPerfilOperativo';
import { TabComplianceProfesional } from './profesional/TabComplianceProfesional';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../context/AppContext';
import { getProfesionalProfile, createOrUpdateProfile } from '../../lib/firebase/db';

const TABS = [
  { id: 'datos', label: 'Datos Personales', icon: User },
  { id: 'operativo', label: 'Perfil Operativo', icon: Settings },
  { id: 'compliance', label: 'Estado de Compliance', icon: Scale },
] as const;

const initialDatos: DatosPersonalesForm = {
  nombreCompleto: '',
  cuil: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  localidad: '',
  domicilio: '',
};

const initialOperativo: PerfilOperativoForm = {
  oficio: '',
  experienciaMineria: '',
  diagramaRoster: '',
  pernocteCampamento: null,
};

function calcProgress(datos: DatosPersonalesForm, operativo: PerfilOperativoForm): number {
  let filled = 0;
  const total = 10;

  if (datos.nombreCompleto) filled++;
  if (datos.cuil) filled++;
  if (datos.fechaNacimiento) filled++;
  if (datos.telefono) filled++;
  if (datos.localidad) filled++;
  if (datos.domicilio) filled++;
  if (operativo.oficio) filled++;
  if (operativo.experienciaMineria) filled++;
  if (operativo.diagramaRoster) filled++;
  if (operativo.pernocteCampamento !== null) filled++;

  return Math.round((filled / total) * 100);
}

export function ProfesionalPerfilPage() {
  const { user, profile } = useAuth();
  const { addToast } = useApp();
  const uid = user?.uid ?? '';

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('datos');
  const [datos, setDatos] = useState<DatosPersonalesForm>(initialDatos);
  const [operativo, setOperativo] = useState<PerfilOperativoForm>(initialOperativo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const p = await getProfesionalProfile(uid);
        if (cancelled) return;
        if (p) {
          setDatos({
            nombreCompleto: p.nombre ?? '',
            cuil: p.cuil ?? '',
            fechaNacimiento: p.fechaNacimiento ?? '',
            telefono: p.telefono ?? '',
            email: p.email ?? '',
            localidad: p.localidad ?? '',
            domicilio: p.domicilio ?? '',
          });
          setOperativo({
            oficio: p.oficio ?? '',
            experienciaMineria: p.experienciaMineria ?? '',
            diagramaRoster: p.diagramaRoster ?? '',
            pernocteCampamento: p.pernocteCampamento ?? null,
          });
        } else if (profile) {
          setDatos((prev) => ({
            ...prev,
            nombreCompleto: profile.nombre ?? prev.nombreCompleto,
            email: profile.email ?? prev.email,
          }));
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) addToast('Error al cargar el perfil.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [uid, profile?.nombre, profile?.email, addToast]);

  const progress = useMemo(
    () => calcProgress(datos, operativo),
    [datos, operativo]
  );

  const handleGuardar = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      await createOrUpdateProfile(uid, 'profesional', {
        nombre: datos.nombreCompleto,
        cuil: datos.cuil || undefined,
        fechaNacimiento: datos.fechaNacimiento || undefined,
        telefono: datos.telefono || undefined,
        email: datos.email || undefined,
        localidad: datos.localidad || '',
        domicilio: datos.domicilio || undefined,
        oficio: operativo.oficio || undefined,
        experienciaMineria: operativo.experienciaMineria || undefined,
        diagramaRoster: operativo.diagramaRoster || undefined,
        pernocteCampamento: operativo.pernocteCampamento ?? undefined,
      });
      addToast('Perfil guardado correctamente.');
    } catch (err) {
      console.error(err);
      addToast('Error al guardar el perfil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
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
            {activeTab === 'compliance' && <TabComplianceProfesional />}

            {activeTab !== 'compliance' && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-500 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
