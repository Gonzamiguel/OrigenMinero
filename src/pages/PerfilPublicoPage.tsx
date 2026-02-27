import { useParams, useNavigate } from 'react-router-dom';
import { BadgeCheck, Leaf, MapPin, Lock, Phone, Download } from 'lucide-react';
import { SemaforoLegal } from '../components/SemaforoLegal';
import { ContactoBloqueado } from '../components/ContactoBloqueado';
import { DossierProfesionalMinera } from '../components/DossierProfesionalMinera';
import { DossierProveedorMinera } from '../components/DossierProveedorMinera';
import { useApp } from '../context/AppContext';
import { useMockAuth } from '../context/MockAuthContext';
import { descargarLegajo } from '../utils/descargarLegajo';

export function PerfilPublicoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { perfiles, historialDocumentos, addToast } = useApp();
  const { canViewContacts, userRole } = useMockAuth();
  const perfil = perfiles.find((p) => p.id === id);

  if (!perfil) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600">Perfil no encontrado</p>
      </div>
    );
  }

  // Minera viendo profesional: Dossier Digital de Compliance
  if (userRole === 'minera' && perfil.tipo === 'profesional') {
    const historialFiltrado = historialDocumentos.filter((h) => h.perfilId === perfil.id);
    return (
      <DossierProfesionalMinera
        perfil={perfil}
        historialFiltrado={historialFiltrado}
        addToast={addToast}
        variant="inline"
      />
    );
  }

  // Minera viendo proveedor: Dossier B2B de Auditoría
  if (userRole === 'minera' && perfil.tipo === 'proveedor') {
    const historialFiltrado = historialDocumentos.filter((h) => h.perfilId === perfil.id);
    return (
      <DossierProveedorMinera
        perfil={perfil}
        historialFiltrado={historialFiltrado}
        addToast={addToast}
        variant="inline"
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8 px-4 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-slate-800">{perfil.nombre.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{perfil.empresa || perfil.nombre}</h1>
                <p className="text-gray-600">{perfil.rubro || perfil.oficio}</p>
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {perfil.localidad}
                </div>
                <div className="flex gap-2 mt-3">
                  {perfil.selloValidado && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                      <BadgeCheck className="w-4 h-4" />
                      Sello Validado
                    </span>
                  )}
                  {perfil.selloSustentable && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                      <Leaf className="w-4 h-4" />
                      Sello Sustentable
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-6 text-gray-600">{perfil.descripcion}</p>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-3">Semáforo Legal</h3>
              <SemaforoLegal semaforo={perfil.semaforo} />
            </div>

            {canViewContacts ? (
              <div className="mt-8 space-y-4">
                {(perfil.telefono || perfil.email) && (
                  <div className="space-y-2">
                    {perfil.telefono && (
                      <a
                        href={`tel:${perfil.telefono}`}
                        className="flex items-center gap-2 w-full py-3 px-4 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        {perfil.telefono}
                      </a>
                    )}
                    {perfil.email && (
                      <a
                        href={`mailto:${perfil.email}`}
                        className="flex items-center gap-2 w-full py-3 px-4 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-medium"
                      >
                        {perfil.email}
                      </a>
                    )}
                  </div>
                )}
                {(() => {
                  const docsOk = Object.values(perfil.semaforo).every((e) => e === 'ok');
                  return docsOk ? (
                    <button
                      onClick={async () => {
                        addToast(`Descargando legajo de ${perfil.empresa || perfil.nombre}...`, 'info');
                        try {
                          const historialFiltrado = historialDocumentos.filter((h) => h.perfilId === perfil.id);
                          await descargarLegajo(perfil, historialFiltrado);
                          addToast('Legajo descargado correctamente.');
                        } catch {
                          addToast('Error al descargar el legajo.', 'error');
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-500 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Legajo (.ZIP)
                    </button>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 font-medium">
                        El legajo no está disponible aún. Algunos documentos están pendientes de validación por el auditor.
                      </p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <div className="mt-8">
                  <ContactoBloqueado />
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      addToast('Iniciá sesión como Empresa para ver el contacto.');
                      navigate('/registro');
                    }}
                    className="flex-1 py-3 px-4 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 flex items-center justify-center gap-2 transition"
                  >
                    <Lock className="w-4 h-4" />
                    Ver Contacto
                  </button>
                  <button
                    onClick={() => {
                      addToast('Iniciá sesión como Empresa para descargar el legajo.');
                      navigate('/registro');
                    }}
                    className="flex-1 py-3 px-4 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 flex items-center justify-center gap-2 transition"
                  >
                    <Lock className="w-4 h-4" />
                    Descargar Legajo (.ZIP)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
