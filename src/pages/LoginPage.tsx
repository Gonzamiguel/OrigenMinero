import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthErrorMessage } from '../lib/firebase/authService';
import { AuthSplitLayout } from '../components/AuthSplitLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(form.email, form.password);
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
        <h2 className="text-2xl font-bold text-white mb-1">Iniciar sesión</h2>
        <p className="text-blue-50 text-sm mb-8">Ingresá con tu cuenta existente</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-400/50 rounded-md text-white text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 bg-white text-slate-900 rounded-md border-0 focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-2 focus:ring-offset-[#1e3a8a] outline-none transition placeholder:text-slate-400"
              placeholder="Ingresá tu email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-3 bg-white text-slate-900 rounded-md border-0 focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-2 focus:ring-offset-[#1e3a8a] outline-none transition placeholder:text-slate-400"
              placeholder="Ingresá tu contraseña"
              required
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#e85d04] focus:ring-[#e85d04]"
              />
              <span className="text-sm text-white">Recordarme</span>
            </label>
            <a
              href="#"
              className="text-sm text-blue-50 hover:text-white transition"
              onClick={(e) => e.preventDefault()}
            >
              Recuperar contraseña
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#e85d04] hover:bg-[#d14d04] disabled:bg-[#e85d04]/60 disabled:cursor-not-allowed text-white font-semibold rounded-md transition uppercase tracking-wide"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-blue-50">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-white hover:text-blue-100 underline underline-offset-2">
            Registrate aquí
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
