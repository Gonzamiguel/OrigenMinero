import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserDocuments } from '../../../lib/firebase/documentService';
import { getLatestDocumentByType } from '../../../lib/firebase/documentUtils';

const PILARES_LEGALES_PROFESIONAL = [
  'DNI (Frente y Dorso)',
  'Antecedentes Penales',
  'Examen Médico (Preocupacional)',
  'Licencia de Conducir',
  'Título/Matrícula',
  'Curriculum Vitae',
  'Certificado de Residencia',
];

function ComplianceCard({
  label,
  estado,
}: {
  label: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'faltante';
}) {
  const styles = {
    pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
    aprobado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rechazado: 'bg-red-100 text-red-800 border-red-200',
    faltante: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const labels = {
    pendiente: 'Esperando auditoría',
    aprobado: 'Validado',
    rechazado: 'Rechazado',
    faltante: 'Faltante',
  };
  const style = styles[estado];
  const text = labels[estado];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <p className="font-medium text-slate-800 mb-2">{label}</p>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {text}
      </span>
    </div>
  );
}

export function TabComplianceProfesional() {
  const { user } = useAuth();
  const [latestByType, setLatestByType] = useState<Map<string, { estado: string }>>(new Map());
  const [loading, setLoading] = useState(true);

  const userId = user?.uid ?? '';

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const docs = await getUserDocuments(userId);
        if (!cancelled) {
          const latest = getLatestDocumentByType(docs);
          const map = new Map<string, { estado: string }>();
          for (const [tipo, doc] of latest) {
            map.set(tipo, { estado: doc.estado });
          }
          setLatestByType(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-slate-500">
        Cargando estado de compliance...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {PILARES_LEGALES_PROFESIONAL.map((label) => {
        const doc = latestByType.get(label);
        const estado = doc ? (doc.estado as 'pendiente' | 'aprobado' | 'rechazado') : 'faltante';
        return (
          <ComplianceCard key={label} label={label} estado={estado} />
        );
      })}
    </div>
  );
}
