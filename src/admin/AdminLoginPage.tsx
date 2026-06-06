import { FormEvent, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Seo } from '@/components/layout/Seo';
import { adminErrorMessage } from './adminErrors';
import { useAdminSession } from './useAdminSession';

export function AdminLoginPage() {
  const { login, isAuthenticated, isRestoring } = useAdminSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin';

  if (!isRestoring && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(
        adminErrorMessage(loginError, 'No fue posible iniciar sesión.', {
          unauthorized: 'Correo o contraseña incorrectos.',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Admin CECAE" description="Portal administrativo de eventos CECAE." path="/admin/login" />
      <main className="grid min-h-screen place-items-center bg-surface px-5 py-10">
        <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-navy text-white">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-orange">CECAE</p>
              <h1 className="font-display text-2xl font-bold text-navy">Portal administrativo</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-navy">
              Correo
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 py-2 text-charcoal shadow-sm"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-navy">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                minLength={12}
                className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 py-2 text-charcoal shadow-sm"
                required
              />
            </label>

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isRestoring}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-orange px-4 py-2 font-semibold text-white shadow-orange transition hover:bg-[#C96513] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
