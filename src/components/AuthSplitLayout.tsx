import type { ReactNode } from 'react';

interface AuthSplitLayoutProps {
  children: ReactNode;
}

/** Layout split-screen: izquierda blanca (logo), derecha azul con diagonal. */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  const brandContent = (
    <div className="flex flex-col items-center text-center">
      <img
        src="/logos/origen-minero.png"
        alt="Origen Minero"
        className="h-16 lg:h-20 w-auto mb-4 lg:mb-5"
      />
      <h1 className="text-xl lg:text-2xl font-bold text-slate-800 uppercase tracking-wide mb-2">
        Origen Minero
      </h1>
      <p className="text-slate-600 text-sm lg:text-base italic">
        El estándar de compliance B2B para la minería
      </p>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row relative overflow-hidden bg-white">
      {/* Columna Izquierda — Logo y marca (solo desktop) */}
      <div className="hidden lg:flex w-full lg:w-[45%] items-center justify-center relative z-10 bg-white">
        {brandContent}
      </div>

      {/* Columna Derecha — Fondo azul con diagonal + formulario */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center relative z-20 px-8 lg:px-16 min-h-[calc(100vh-4rem)] bg-[#1e3a8a] lg:bg-transparent">
        {/* Fondo azul con corte diagonal (solo desktop) */}
        <div
          className="absolute inset-0 bg-[#1e3a8a] -z-10 hidden lg:block"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
        {/* Logo en mobile */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <img
            src="/logos/origen-minero.png"
            alt="Origen Minero"
            className="h-12 w-auto mb-2"
          />
          <span className="text-white font-bold text-lg">Origen Minero</span>
        </div>
        {children}
      </div>
    </div>
  );
}
