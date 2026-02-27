import {
  User,
  Search,
  FileText,
  Gavel,
  Settings,
  History,
  LayoutDashboard,
  FileCheck,
  BadgeCheck,
  UserCircle,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../context/MockAuthContext';

export interface DashboardLink {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

/** Links para el sidebar del dashboard. roles: a quiénes se muestra. NO se usan en navbar. */
export const DASHBOARD_LINKS: DashboardLink[] = [
  { to: '/dashboard/proveedor', label: 'Mi Panel', icon: User, roles: ['proveedor'] },
  { to: '/dashboard/proveedor/perfil', label: 'Mi Perfil Corporativo', icon: Building2, roles: ['proveedor'] },
  { to: '/dashboard/proveedor?tab=historial', label: 'Historial de archivos', icon: History, roles: ['proveedor'] },
  { to: '/dashboard/proveedor?tab=licitaciones', label: 'Licitaciones', icon: Gavel, roles: ['proveedor'] },
  { to: '/dashboard/profesional/perfil', label: 'Mi Perfil', icon: UserCircle, roles: ['profesional'] },
  { to: '/dashboard/profesional?tab=historial', label: 'Historial de archivos', icon: History, roles: ['profesional'] },
  { to: '/dashboard/profesional?tab=licitaciones', label: 'Licitaciones', icon: Gavel, roles: ['profesional'] },
  { to: '/dashboard/minera', label: 'Buscador', icon: Search, roles: ['minera'] },
  { to: '/dashboard/minera?tab=rse', label: 'RSE', icon: FileText, roles: ['minera'] },
  { to: '/dashboard/minera?tab=licitaciones', label: 'Licitaciones', icon: Gavel, roles: ['minera'] },
  { to: '/dashboard/auditor', label: 'Inicio', icon: LayoutDashboard, roles: ['auditor'] },
  { to: '/dashboard/auditor?tab=documentos', label: 'Aprobar documentos', icon: FileCheck, roles: ['auditor'] },
  { to: '/dashboard/auditor?tab=sellos', label: 'Aprobar sellos', icon: BadgeCheck, roles: ['auditor'] },
  { to: '/admin-gonzalo', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export function getLinksForRole(role: UserRole, canViewLicitaciones: boolean): DashboardLink[] {
  return DASHBOARD_LINKS.filter((l) => {
    if (!l.roles.includes(role)) return false;
    if (l.to.includes('licitaciones') && !canViewLicitaciones) return false;
    return true;
  });
}

/** Solo "Mi Panel" para la navbar. Cada rol tiene un único enlace que lleva a su dashboard. */
export function getNavbarDashboardLink(role: UserRole): DashboardLink | null {
  const entryPoints: Record<string, DashboardLink> = {
    proveedor: { to: '/dashboard/proveedor', label: 'Mi Panel', icon: User, roles: ['proveedor'] },
    profesional: { to: '/dashboard/profesional/perfil', label: 'Mi Panel', icon: User, roles: ['profesional'] },
    minera: { to: '/dashboard/minera', label: 'Mi Panel', icon: Search, roles: ['minera'] },
    auditor: { to: '/dashboard/auditor', label: 'Mi Panel', icon: LayoutDashboard, roles: ['auditor'] },
    admin: { to: '/admin-gonzalo', label: 'Admin', icon: Settings, roles: ['admin'] },
  };
  return entryPoints[role] || null;
}
