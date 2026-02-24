import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Perfil, ProyectoRSE, Licitacion, PerfilAuditoria } from '../types';
import {
  PERFILES,
  PROYECTOS_RSE,
  LICITACIONES,
  PERFILES_AUDITORIA,
} from '../data/mockData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: { id: string; tipo: 'proveedor' | 'minera' | 'admin' } | null;
  perfiles: Perfil[];
  proyectosRSE: ProyectoRSE[];
  licitaciones: Licitacion[];
  perfilesAuditoria: PerfilAuditoria[];
  toasts: Toast[];
  setUser: (user: AppContextType['user']) => void;
  addProyectoRSE: (proyecto: Omit<ProyectoRSE, 'id'>) => void;
  addLicitacion: (licitacion: Omit<Licitacion, 'id' | 'postulantes'>) => void;
  postularLicitacion: (licitacionId: string, perfilId: string) => void;
  aprobarSello: (perfilId: string, tipo: 'local' | 'sustentable') => void;
  actualizarDocumento: (perfilId: string, doc: keyof Perfil['semaforo']) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppContextType['user']>({ id: '1', tipo: 'proveedor' });
  const [perfiles, setPerfiles] = useState<Perfil[]>(PERFILES);
  const [proyectosRSE, setProyectosRSE] = useState<ProyectoRSE[]>(PROYECTOS_RSE);
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>(LICITACIONES);
  const [perfilesAuditoria, setPerfilesAuditoria] = useState<PerfilAuditoria[]>(PERFILES_AUDITORIA);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addProyectoRSE = useCallback((proyecto: Omit<ProyectoRSE, 'id'>) => {
    setProyectosRSE((prev) => [
      ...prev,
      { ...proyecto, id: (prev.length + 1).toString(), estado: 'activo' },
    ]);
  }, []);

  const addLicitacion = useCallback((licitacion: Omit<Licitacion, 'id' | 'postulantes'>) => {
    setLicitaciones((prev) => [
      ...prev,
      { ...licitacion, id: (prev.length + 1).toString(), postulantes: [] },
    ]);
  }, []);

  const postularLicitacion = useCallback((licitacionId: string, perfilId: string) => {
    setLicitaciones((prev) =>
      prev.map((l) =>
        l.id === licitacionId
          ? { ...l, postulantes: [...l.postulantes, perfilId] }
          : l
      )
    );
  }, []);

  const aprobarSello = useCallback((perfilId: string, tipo: 'local' | 'sustentable') => {
    setPerfilesAuditoria((prev) => prev.filter((p) => p.id !== perfilId));
    setPerfiles((prev) =>
      prev.map((p) => {
        if (p.id === perfilId) {
          if (tipo === 'local') return { ...p, selloValidado: true };
          return { ...p, selloSustentable: true };
        }
        return p;
      })
    );
  }, []);

  const actualizarDocumento = useCallback(
    (perfilId: string, doc: keyof Perfil['semaforo']) => {
      setPerfiles((prev) =>
        prev.map((p) =>
          p.id === perfilId
            ? { ...p, semaforo: { ...p.semaforo, [doc]: 'en_revision' as const } }
            : p
        )
      );
      addToast('Documento cargado. En revisión.', 'info');
    },
    [addToast]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        perfiles,
        proyectosRSE,
        licitaciones,
        perfilesAuditoria,
        toasts,
        setUser,
        addProyectoRSE,
        addLicitacion,
        postularLicitacion,
        aprobarSello,
        actualizarDocumento,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
