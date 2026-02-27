import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Perfil, ProyectoRSE, Licitacion, PerfilAuditoria, DocumentoAuditoria, HistorialDocumento, TipoDocumento } from '../types';
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
  documentosPendientesAuditoria: DocumentoAuditoria[];
  historialDocumentos: HistorialDocumento[];
  toasts: Toast[];
  setUser: (user: AppContextType['user']) => void;
  addProyectoRSE: (proyecto: Omit<ProyectoRSE, 'id'>) => void;
  addLicitacion: (licitacion: Omit<Licitacion, 'id' | 'postulantes'>) => void;
  postularLicitacion: (licitacionId: string, perfilId: string) => void;
  aprobarSello: (perfilId: string, tipo: 'local' | 'sustentable') => void;
  cargarDocumento: (perfilId: string, doc: TipoDocumento, file: File) => void;
  cargarCV: (perfilId: string, file: File) => void;
  aprobarDocumento: (docId: string) => void;
  rechazarDocumento: (docId: string) => void;
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
  const [documentosPendientesAuditoria, setDocumentosPendientesAuditoria] = useState<DocumentoAuditoria[]>([]);
  const [historialDocumentos, setHistorialDocumentos] = useState<HistorialDocumento[]>([]);
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
      { ...proyecto, id: (prev.length + 1).toString(), estado: proyecto.estado || 'activo' },
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

  const cargarDocumento = useCallback(
    (perfilId: string, doc: TipoDocumento, file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        addToast('Solo se permiten archivos PDF.', 'error');
        return;
      }

      const perfil = perfiles.find((p) => p.id === perfilId);
      if (!perfil) return;

      const now = new Date().toISOString();
      const historialId = `hist-${Date.now()}-${perfilId}-${doc}`;

      const historial: HistorialDocumento = {
        id: historialId,
        perfilId,
        tipoDocumento: doc,
        nombreArchivo: file.name,
        fechaCarga: now,
        estado: 'en_revision',
      };
      setHistorialDocumentos((p) => [historial, ...p]);

      const docAuditoria: DocumentoAuditoria = {
        id: `doc-${Date.now()}-${perfilId}-${doc}`,
        historialId,
        perfilId,
        tipoDocumento: doc,
        nombrePerfil: perfil.nombre,
        empresa: perfil.empresa,
        localidad: perfil.localidad,
        fechaCarga: now,
      };
      setDocumentosPendientesAuditoria((p) => [...p, docAuditoria]);

      setPerfiles((prev) =>
        prev.map((p) =>
          p.id === perfilId
            ? { ...p, semaforo: { ...p.semaforo, [doc]: 'en_revision' as const } }
            : p
        )
      );
      addToast(`"${file.name}" cargado. Será revisado por el auditor.`, 'info');
    },
    [addToast, perfiles]
  );

  const cargarCV = useCallback(
    (perfilId: string, file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        addToast('Solo se permiten archivos PDF.', 'error');
        return;
      }
      const now = new Date().toISOString();
      const historial: HistorialDocumento = {
        id: `hist-cv-${Date.now()}-${perfilId}`,
        perfilId,
        tipoDocumento: 'cv',
        nombreArchivo: file.name,
        fechaCarga: now,
        estado: 'en_revision',
      };
      setHistorialDocumentos((p) => [historial, ...p]);
      addToast(`"${file.name}" cargado. Será revisado por el equipo.`, 'info');
    },
    [addToast]
  );

  const aprobarDocumento = useCallback(
    (docId: string) => {
      const doc = documentosPendientesAuditoria.find((d) => d.id === docId);
      if (!doc) return;

      const now = new Date().toISOString();
      setDocumentosPendientesAuditoria((prev) => prev.filter((d) => d.id !== docId));
      setHistorialDocumentos((prev) =>
        prev.map((h) =>
          h.id === doc.historialId ? { ...h, estado: 'aprobado' as const, fechaResolucion: now } : h
        )
      );
      setPerfiles((prev) =>
        prev.map((p) =>
          p.id === doc.perfilId
            ? { ...p, semaforo: { ...p.semaforo, [doc.tipoDocumento]: 'ok' as const } }
            : p
        )
      );
      addToast('Documento aprobado. Visible para mineras.');
    },
    [documentosPendientesAuditoria, addToast]
  );

  const rechazarDocumento = useCallback(
    (docId: string) => {
      const doc = documentosPendientesAuditoria.find((d) => d.id === docId);
      if (!doc) return;

      const now = new Date().toISOString();
      setDocumentosPendientesAuditoria((prev) => prev.filter((d) => d.id !== docId));
      setHistorialDocumentos((prev) =>
        prev.map((h) =>
          h.id === doc.historialId ? { ...h, estado: 'rechazado' as const, fechaResolucion: now } : h
        )
      );
      setPerfiles((prev) =>
        prev.map((p) =>
          p.id === doc.perfilId
            ? { ...p, semaforo: { ...p.semaforo, [doc.tipoDocumento]: 'vencido' as const } }
            : p
        )
      );
      addToast('Documento rechazado. El proveedor deberá volver a cargarlo.', 'error');
    },
    [documentosPendientesAuditoria, addToast]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        perfiles,
        proyectosRSE,
        licitaciones,
        perfilesAuditoria,
        documentosPendientesAuditoria,
        historialDocumentos,
        toasts,
        setUser,
        addProyectoRSE,
        addLicitacion,
        postularLicitacion,
        aprobarSello,
        cargarDocumento,
        cargarCV,
        aprobarDocumento,
        rechazarDocumento,
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
