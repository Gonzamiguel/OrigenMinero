import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, HardHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuthErrorMessage } from '../lib/firebase/authService';
import { AuthSplitLayout } from '../components/AuthSplitLayout';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'proveedor' | 'profesional' | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!role) {
      setError('Seleccioná un tipo de cuenta.');
      return;
    }
    if (!form.nombre.trim()) {
      setError('El nombre o razón social es obligatorio.');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, role, form.nombre.trim());
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-1">Crear cuenta</h2>
        <p className="text-blue-50 text-sm mb-8">Seleccioná tu tipo de cuenta y completá los datos</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-md text-white text-sm">
              {error}
            </div>
          )}

          {/* Toggle de rol */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Tipo de cuenta</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('proveedor')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 transition ${
                  role === 'proveedor'
                    ? 'bg-[#e85d04] border-[#e85d04] text-white'
                    : 'border-white/60 text-white hover:border-white bg-white/10'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="font-medium text-sm">Soy Empresa</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('profesional')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md border-2 transition ${
                  role === 'profesional'
                    ? 'bg-[#e85d04] border-[#e85d04] text-white'
                    : 'border-white/60 text-white hover:border-white bg-white/10'
                }`}
              >
                <HardHat className="w-5 h-5" />
                <span className="font-medium text-sm">Soy Profesional</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Nombre o Razón Social</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez o Mi Empresa SRL"
              className="w-full p-3 bg-white text-slate-900 rounded-md border-0 focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-2 focus:ring-offset-[#1e3a8a] outline-none transition placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              className="w-full p-3 bg-white text-slate-900 rounded-md border-0 focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-2 focus:ring-offset-[#1e3a8a] outline-none transition placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="w-full p-3 bg-white text-slate-900 rounded-md border-0 focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-2 focus:ring-offset-[#1e3a8a] outline-none transition placeholder:text-slate-400"
              required
              minLength={6}
            />
            <p className="text-xs text-blue-50 mt-1">Mínimo 6 caracteres</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#e85d04] hover:bg-[#d14d04] disabled:bg-[#e85d04]/60 disabled:cursor-not-allowed text-white font-semibold rounded-md transition uppercase tracking-wide"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-blue-50">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-white hover:text-blue-100 underline underline-offset-2">
            Iniciá sesión aquí
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
