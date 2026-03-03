import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Loader2,
  UserMinus,
  ExternalLink,
  Search,
  Building2,
  HardHat,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../context/AppContext';
import { getContratistasVinculados, toggleContratistaNomina } from '../../../lib/firebase/empresaService';
import { getPerfilById } from '../../../lib/firebase/networkService';
import { is100Compliance } from '../../../components/empresa/UserCard';
import type { Perfil } from '../../../types';

export function EmpresaNominaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useApp();
  const [contratistas, setContratistas] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [desvinculando, setDesvinculando] = useState<string | null>(null);

  const empresaUid = user?.uid ?? '';

  useEffect(() => {
    if (!empresaUid) return;
    let cancelled = false;
    getContratistasVinculados(empresaUid)
      .then((ids) => {
        if (cancelled) return;
        return Promise.all(ids.map((id) => getPerfilById(id)));
      })
      .then((profiles) => {
        if (cancelled) return;
        setContratistas((profiles ?? []).filter((p): p is Perfil => p != null));
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) addToast('Error al cargar la nómina.', 'error');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [empresaUid, addToast]);

  const handleDesvincular = async (contratistaId: string) => {
    if (!empresaUid) return;
    setDesvinculando(contratistaId);
    try {
      const { added } = await toggleContratistaNomina(empresaUid, contratistaId);
      if (!added) {
        setContratistas((prev) => prev.filter((p) => p.id !== contratistaId));
        addToast('Contratista desvinculado de tu nómina.');
      }
    } catch (err) {
      console.error(err);
      addToast('Error al desvincular.', 'error');
    } finally {
      setDesvinculando(null);
    }
  };

  const complianceStatus = (perfil: Perfil) => {
    const apto = is100Compliance(perfil.semaforo);
    const hasVencido = Object.values(perfil.semaforo).some((v) => v === 'vencido');
    if (apto) return { label: '100% Apto', className: 'bg-emerald-100 text-emerald-700' };
    if (hasVencido) return { label: 'Riesgo / Vencido', className: 'bg-red-100 text-red-700' };
    return { label: 'En revisión', className: 'bg-amber-100 text-amber-700' };
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mi Nómina</h1>
            <p className="text-slate-600 text-sm">
              Monitoreo de compliance en tiempo real de tus contratistas vinculados.
            </p>
          </div>
        </div>

        {contratistas.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Tu nómina está vacía
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Buscá proveedores y profesionales en la red y vinculalos a tu nómina para recibir
              alertas cuando se les venza un documento.
            </p>
            <button
              onClick={() => navigate('/dashboard/empresa/buscar')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-500 transition"
            >
              <Search className="w-4 h-4" />
              Ir al Buscador de Red
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Contratista
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Tipo</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Estado de Compliance
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Última Actualización
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contratistas.map((p) => {
                    const status = complianceStatus(p);
                    const titulo = p.empresa || p.nombre;
                    const rubro = p.rubro || p.oficio || '-';
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-slate-800">{titulo}</p>
                            <p className="text-sm text-slate-500">{rubro}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-slate-600">
                            {p.tipo === 'proveedor' ? (
                              <>
                                <Building2 className="w-4 h-4" />
                                Empresa
                              </>
                            ) : (
                              <>
                                <HardHat className="w-4 h-4" />
                                Profesional
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-sm">-</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/empresa/perfil/${p.id}`)}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Ver Perfil
                            </button>
                            <button
                              onClick={() => handleDesvincular(p.id)}
                              disabled={desvinculando === p.id}
                              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                            >
                              {desvinculando === p.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserMinus className="w-4 h-4" />
                              )}
                              Desvincular
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
