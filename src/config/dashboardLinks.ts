import {
  User,
  Search,
  FileText,
  Gavel,
  Settings,
  History,
  LayoutDashboard,
  FileCheck,
  UserCircle,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../lib/firebase/types';

export type RoleOrGuest = UserRole | 'guest';

export interface DashboardLink {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

/** Links para el sidebar del dashboard. roles: a quiénes se muestra. NO se usan en navbar. */
export const DASHBOARD_LINKS: DashboardLink[] = [
  { to: '/dashboard/documentos', label: 'Documentos', icon: FileText, roles: ['proveedor'] },
  { to: '/dashboard/proveedor/perfil', label: 'Mi Perfil Corporativo', icon: Building2, roles: ['proveedor'] },
  { to: '/dashboard/historial', label: 'Historial de archivos', icon: History, roles: ['proveedor'] },
  { to: '/dashboard/proveedor?tab=licitaciones', label: 'Licitaciones', icon: Gavel, roles: ['proveedor'] },
  { to: '/dashboard/profesional/documentos', label: 'Documentos', icon: FileText, roles: ['profesional'] },
  { to: '/dashboard/profesional/perfil', label: 'Mi Perfil Profesional', icon: UserCircle, roles: ['profesional'] },
  { to: '/dashboard/profesional/historial', label: 'Historial de archivos', icon: History, roles: ['profesional'] },
  { to: '/dashboard/profesional?tab=licitaciones', label: 'Licitaciones', icon: Gavel, roles: ['profesional'] },
  { to: '/dashboard/minera', label: 'Buscador', icon: Search, roles: ['minera'] },
  { to: '/dashboard/minera?tab=rse', label: 'RSE', icon: FileText, roles: ['minera'] },
  { to: '/dashboard/minera?tab=licitaciones', label: 'Licitaciones', icon: Gavel, roles: ['minera'] },
  { to: '/dashboard/auditor/pendientes', label: 'Bandeja de Entrada', icon: FileCheck, roles: ['auditor'] },
  { to: '/dashboard/auditor/completadas', label: 'Auditorías Completadas', icon: History, roles: ['auditor'] },
  { to: '/admin-gonzalo', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export function getLinksForRole(role: RoleOrGuest, canViewLicitaciones: boolean): DashboardLink[] {
  if (role === 'guest') return [];
  return DASHBOARD_LINKS.filter((l) => {
    if (!l.roles.includes(role)) return false;
    if (l.to.includes('licitaciones') && !canViewLicitaciones) return false;
    return true;
  });
}

/** Solo "Mi Panel" para la navbar. Cada rol tiene un único enlace que lleva a su dashboard. */
export function getNavbarDashboardLink(role: RoleOrGuest): DashboardLink | null {
  const entryPoints: Record<string, DashboardLink> = {
  proveedor: { to: '/dashboard/documentos', label: 'Mi Panel', icon: User, roles: ['proveedor'] },
  profesional: { to: '/dashboard/profesional/documentos', label: 'Mi Panel', icon: User, roles: ['profesional'] },
    minera: { to: '/dashboard/minera', label: 'Mi Panel', icon: Search, roles: ['minera'] },
    auditor: { to: '/dashboard/auditor/pendientes', label: 'Mi Panel', icon: LayoutDashboard, roles: ['auditor'] },
    admin: { to: '/admin-gonzalo', label: 'Admin', icon: Settings, roles: ['admin'] },
  };
  return entryPoints[role] || null;
}
