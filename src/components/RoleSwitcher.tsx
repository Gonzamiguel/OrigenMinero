import { useState } from 'react';
import { UserCircle } from 'lucide-react';
import { useMockAuth } from '../context/MockAuthContext';
import type { UserRole } from '../context/MockAuthContext';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'guest', label: 'Visitante' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'minera', label: 'Minera' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'admin', label: 'Admin' },
];

export function RoleSwitcher() {
  const { userRole, setUserRole } = useMockAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 text-xs font-medium transition"
          title="Cambiar rol (solo para testing)"
        >
          <UserCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{ROLES.find((r) => r.value === userRole)?.label}</span>
        </button>
        {open && (
          <>
            <div
              className="fixed inset-0"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute bottom-full right-0 mb-2 py-2 bg-white rounded-lg shadow-xl border border-slate-200 min-w-[140px]">
              {ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setUserRole(value);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${
                    userRole === value ? 'bg-amber-50 text-amber-700 font-medium' : 'text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
