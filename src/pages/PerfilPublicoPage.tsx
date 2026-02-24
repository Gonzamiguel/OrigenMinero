import { useParams } from 'react-router-dom';
import { BadgeCheck, Leaf, MapPin, Lock } from 'lucide-react';
import { SemaforoLegal } from '../components/SemaforoLegal';
import { useApp } from '../context/AppContext';

export function PerfilPublicoPage() {
  const { id } = useParams();
  const { perfiles } = useApp();
  const perfil = perfiles.find((p) => p.id === id);

  if (!perfil) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600">Perfil no encontrado</p>
      </div>
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

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Requiere inicio de sesión corporativo</p>
                <p className="text-sm text-amber-700 mt-1">
                  Los botones "Ver Contacto" y "Descargar Legajo (.ZIP)" están disponibles solo para empresas mineras registradas.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                disabled
                className="flex-1 py-3 px-4 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Ver Contacto
              </button>
              <button
                disabled
                className="flex-1 py-3 px-4 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Descargar Legajo (.ZIP)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
