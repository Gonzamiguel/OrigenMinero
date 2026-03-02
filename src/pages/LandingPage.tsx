import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  HardHat,
  Shield,
  Scale,
  Lock,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { PARTNERS } from '../data/mockData';

/** Imágenes de fondo del hero (slider). */
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
];

const BENEFICIOS = [
  {
    icon: Shield,
    titulo: 'Auditoría en Tiempo Real',
    desc: 'Revisamos ART, AFIP y Seguros para que tu equipo no tenga que hacerlo.',
  },
  {
    icon: Scale,
    titulo: 'Cumplimiento Legal Local',
    desc: 'Mapeo automático de los 4 Pilares de la Ley Minera provincial.',
  },
  {
    icon: Lock,
    titulo: 'Privacidad Total',
    desc: 'Datos y legajos estrictamente confidenciales. Solo operadoras verificadas acceden a la información.',
  },
  {
    icon: Zap,
    titulo: 'Contratación Ágil',
    desc: 'De la necesidad urgente a la contratación en minutos, con riesgo cero.',
  },
];

const PASOS = [
  {
    numero: 1,
    titulo: 'Carga y Registro',
    desc: 'El proveedor sube su documentación legal a nuestra bóveda segura.',
  },
  {
    numero: 2,
    titulo: 'Validación Experta',
    desc: 'Nuestro equipo de auditores (Partner Local) verifica y emite el Semáforo Verde.',
  },
  {
    numero: 3,
    titulo: 'Conexión B2B',
    desc: 'La minera busca, descarga el legajo perfecto (.ZIP) y contrata.',
  },
];

export function LandingPage() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50">
      {/* 1. Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 py-12 overflow-hidden">
        <div className="absolute inset-0">
          {HERO_IMAGES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                i === heroIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          <div className="absolute inset-0 bg-slate-900/60 z-[1]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
            El estándar de compliance B2B para la minería.
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 drop-shadow-md max-w-3xl mx-auto leading-relaxed">
            Conectamos operadoras mineras con talento y proveedores locales 100% auditados, mitigando riesgos legales y asegurando el cumplimiento de la Ley Minera.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Solicitar Demo (Operadoras)
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-200 hover:border-slate-300 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg transition-all"
            >
              Registrar mi Pyme / Perfil
            </Link>
          </div>
          <p className="text-sm text-slate-300/90">
            🔒 Más de 500 legajos digitales validados y listos para trabajar.
          </p>
        </div>
      </section>

      {/* 2. Sección de Audiencias Divididas (Split-Cards) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
            Soluciones diseñadas para cada eslabón de la cadena.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Tarjeta Operadoras */}
            <div className="bg-blue-950 rounded-2xl p-8 lg:p-10 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">Para Operadoras y Contratistas</h3>
              <ul className="space-y-3 text-slate-200 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  Visibilidad total de la red
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  Mitigación de juicios laborales
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  Cumplimiento de cuotas locales de San Juan
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium text-sm transition-colors"
              >
                Ver soluciones Enterprise
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tarjeta Proveedores */}
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
                <HardHat className="w-7 h-7 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Para Proveedores y Profesionales</h3>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  Un solo legajo digital
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  Validación rápida
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  Acceso directo a licitaciones mineras
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-500 font-medium text-sm transition-colors"
              >
                Comenzar gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cuadrícula de Beneficios (Grid 2x2) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
            ¿Por qué estandarizar tu cadena de suministro con nosotros?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {BENEFICIOS.map(({ icon: Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="flex flex-col items-center text-center p-6 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                  <Icon className="w-8 h-8 text-blue-950" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{titulo}</h3>
                <p className="text-slate-600 leading-relaxed max-w-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Cómo Funciona (Step-by-step) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
            Cómo Funciona
          </h2>
          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-stretch">
            {PASOS.map(({ numero, titulo, desc }) => (
              <div key={numero} className="flex-1 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-blue-950 text-white flex items-center justify-center text-xl font-bold mb-6">
                  {numero}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{titulo}</h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Banner de Confianza (Social Proof) */}
      <section className="py-16 px-4 bg-slate-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-10">
            Auditoría y compliance respaldados por
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {PARTNERS.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="h-14 min-w-[120px] bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm opacity-80 hover:opacity-100 transition-all px-4"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  title={p.nombre}
                  className="max-h-8 max-w-24 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call to Action Final */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-blue-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            ¿Listo para operar sin fricciones administrativas?
          </h2>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-lg"
          >
            Contactar al equipo de Ventas
          </Link>
        </div>
      </section>
    </div>
  );
}
