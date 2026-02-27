import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat, Factory, Handshake, Sprout, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { PERFILES, LOCALIDADES, PARTNERS } from '../data/mockData';
import LogoLoop from '../components/LogoLoop';

/** Imágenes de fondo del hero (slider). Podés usar /hero/montana1.jpg locales o URLs externas. */
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
];

const PILARES = [
  { icon: HardHat, titulo: 'Mano de Obra Local', desc: 'Validación de residencia y antecedentes.', color: 'blue' },
  { icon: Factory, titulo: 'Proveedores Locales', desc: 'Validación AFIP, ART, Seguros.', color: 'orange' },
  { icon: Handshake, titulo: 'Inversión Social / RSE', desc: 'Trazabilidad de proyectos comunitarios.', color: 'blue' },
  { icon: Sprout, titulo: 'Medio Ambiente', desc: 'Sello de prácticas sustentables.', color: 'green' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [localidad, setLocalidad] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const profesionalesScrollRef = useRef<HTMLDivElement>(null);
  const proveedoresScrollRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 240;
  const CARD_GAP = 32;
  const scrollProfesionales = (delta: number) => {
    const el = profesionalesScrollRef.current;
    if (!el) return;
    const step = CARD_WIDTH + CARD_GAP;
    el.scrollTo({ left: el.scrollLeft + delta * step, behavior: 'smooth' });
  };
  const scrollProveedores = (delta: number) => {
    const el = proveedoresScrollRef.current;
    if (!el) return;
    const step = CARD_WIDTH + CARD_GAP;
    el.scrollTo({ left: el.scrollLeft + delta * step, behavior: 'smooth' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const profesionales = PERFILES.filter((p) => p.tipo === 'profesional' && p.selloValidado).slice(0, 9);
  const proveedores = PERFILES.filter((p) => p.tipo === 'proveedor' && p.selloValidado).slice(0, 9);

  const handleBuscar = () => {
    const loc = localidad ? `?localidad=${encodeURIComponent(localidad)}` : '';
    if (busqueda.toLowerCase().includes('proveedor') || busqueda.toLowerCase().includes('empresa')) {
      navigate(`/proveedores${loc}`);
    } else if (busqueda.toLowerCase().includes('profesional') || busqueda.toLowerCase().includes('soldador') || busqueda.toLowerCase().includes('chofer')) {
      navigate(`/profesionales${loc}`);
    } else {
      navigate(`/proveedores${loc}`);
    }
  };

  const CardPerfil = ({ id, oficio, nombre, descripcion, localidad }: (typeof profesionales)[0]) => (
    <Link
      to={`/perfil/publico/${id}`}
      className="bg-white rounded-lg border border-slate-200 shadow-md flex flex-col w-[240px] h-[340px] hover:shadow-lg hover:border-slate-300 transition overflow-hidden"
    >
      <div className="bg-slate-100 h-24 flex items-center justify-center flex-shrink-0">
        <span className="text-3xl font-bold text-slate-600">{nombre.charAt(0)}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">{oficio}</p>
        <h3 className="font-bold text-slate-800 text-base mb-2">{nombre}</h3>
        <p className="text-sm text-slate-600 flex-1 line-clamp-4">{descripcion}</p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">{localidad}</span>
          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
            <BadgeCheck className="w-3.5 h-3.5" />
            Validado
          </span>
        </div>
      </div>
    </Link>
  );

  const CardProveedor = ({ id, rubro, empresa, nombre, descripcion, localidad }: (typeof proveedores)[0]) => (
    <Link
      to={`/perfil/publico/${id}`}
      className="bg-white rounded-lg border border-slate-200 shadow-md flex flex-col w-[240px] h-[340px] hover:shadow-lg hover:border-slate-300 transition overflow-hidden"
    >
      <div className="bg-slate-100 h-24 flex items-center justify-center flex-shrink-0">
        <span className="text-3xl font-bold text-slate-600">{(empresa || nombre).charAt(0)}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">{rubro}</p>
        <h3 className="font-bold text-slate-800 text-base mb-2">{empresa}</h3>
        <p className="text-sm text-slate-600 flex-1 line-clamp-4">{descripcion}</p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">{localidad}</span>
          <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
            <BadgeCheck className="w-3.5 h-3.5" />
            Validado
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="bg-slate-50">
      {/* Sección 1: Hero con búsqueda - slider de montañas de fondo */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 py-12 overflow-hidden">
        {/* Slider de fondo */}
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
        {/* Contenido fijo encima */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Conectamos la minería con talento local validado
          </h1>
          <p className="text-xl text-slate-200 mb-8 drop-shadow-md">
            Marketplace alineado con los 4 Pilares de la Ley Minera de San Juan
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Buscar proveedores, profesionales..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 bg-white/95 border-2 border-amber-500 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition shadow-lg"
            />
            <select
              value={localidad}
              onChange={(e) => setLocalidad(e.target.value)}
              className="px-4 py-3 rounded-lg text-slate-900 min-w-[180px] border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition bg-white/95 shadow-lg"
            >
              <option value="">Todas las localidades</option>
              {LOCALIDADES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button
              onClick={handleBuscar}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold transition text-white shadow-lg"
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Sección 2: 4 Pilares */}
      <section className="flex flex-col justify-start pt-20 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-100">
        <div className="max-w-6xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-30 items-start">
            {/* Izquierda 50%: Título y descripción - pegados a la izquierda */}
            <div className="text-left justify-self-start w-full pl-0">
              <h2 className="text-4xl md:text-6xl xl:text-7xl font-extrabold text-slate-800 leading-tight">
                4 Pilares
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                La Ley Minera de San Juan se sustenta en cuatro pilares fundamentales que garantizan el desarrollo responsable de la industria: mano de obra local validada, proveedores con documentación en regla, inversión social trazable y prácticas ambientales sustentables.
              </p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                La Ley Minera de San Juan se sustenta en cuatro pilares fundamentales que garantizan el desarrollo responsable de la industria: mano de obra local validada.
              </p>
            </div>
            {/* Derecha 50%: Cards en grid 2x2 - contenedores más grandes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-12">
              {PILARES.map(({ icon: Icon, titulo, desc, color }) => {
                const iconBg = color === 'blue' ? 'bg-blue-100' : color === 'orange' ? 'bg-amber-100' : 'bg-emerald-100';
                const iconColor = color === 'blue' ? 'text-blue-600' : color === 'orange' ? 'text-amber-600' : 'text-emerald-600';
                return (
                  <div
                    key={titulo}
                    className="bg-white p-7 lg:p-8 rounded-2xl flex flex-col items-center text-center shadow-md"
                  >
                    <div className={`w-20 h-20 rounded-2xl ${iconBg} flex items-center justify-center mb-5`}>
                      <Icon className={`w-10 h-10 ${iconColor}`} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 text-base lg:text-lg">{titulo}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Profesionales validados - 3 cards con slider */}
      <section className="flex flex-col justify-center py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-10">
            Profesionales validados
          </h2>
          <div className="flex items-center gap-6 justify-center w-full">
            <button
              onClick={() => scrollProfesionales(-1)}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div
              ref={profesionalesScrollRef}
              className="flex-1 min-w-0 max-w-[832px] flex gap-8 overflow-x-auto overflow-y-hidden scroll-smooth py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {profesionales.map((p) => (
                <div
                  key={p.id}
                  data-card
                  className="flex-shrink-0 w-[240px] snap-start"
                >
                  <CardPerfil {...p} />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollProfesionales(1)}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Sección 4: Partners estratégicos - LogoLoop */}
      <section className="py-10 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
            Partners estratégicos
          </h2>
          <div className="h-[140px] relative overflow-hidden">
            <LogoLoop
              logos={PARTNERS.map((p) => ({
                src: p.src,
                alt: p.alt,
                title: p.nombre,
              }))}
              speed={60}
              direction="left"
              logoHeight={80}
              gap={56}
              pauseOnHover
              scaleOnHover
              fadeOut
              fadeOutColor="#f8fafc"
              ariaLabel="Partners estratégicos"
            />
          </div>
        </div>
      </section>

      {/* Sección 5: Proveedores validados - 3 cards con slider */}
      <section className="flex flex-col justify-center py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-10">
            Proveedores validados
          </h2>
          <div className="flex items-center gap-6 justify-center w-full">
            <button
              onClick={() => scrollProveedores(-1)}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div
              ref={proveedoresScrollRef}
              className="flex-1 min-w-0 max-w-[832px] flex gap-8 overflow-x-auto overflow-y-hidden scroll-smooth py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {proveedores.map((p) => (
                <div
                  key={p.id}
                  data-card
                  className="flex-shrink-0 w-[240px] snap-start"
                >
                  <CardProveedor {...p} />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollProveedores(1)}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

