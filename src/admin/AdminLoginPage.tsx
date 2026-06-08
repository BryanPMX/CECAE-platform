import { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
      <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-surface px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(26,58,107,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(26,58,107,0.055)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <section className="w-full max-w-[28rem] rounded-lg border border-line bg-white p-5 shadow-soft sm:p-7">
          <div className="flex flex-col items-center text-center">
            <img
              src="/cecae-footer-logo-1024x256.png"
              alt="CECAE"
              width="1024"
              height="256"
              className="h-10 w-auto object-contain"
            />
            <span className="mt-5 grid h-11 w-11 place-items-center rounded-md bg-navy text-white shadow-sm">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-orange">
              Acceso seguro
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight text-navy sm:text-3xl">
              Portal administrativo
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-midGray">
              Ingresa con tu cuenta autorizada para administrar eventos CECAE.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="admin-email" className="text-sm font-semibold text-navy">
                Correo
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midGray"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  inputMode="email"
                  className="focus-ring min-h-12 w-full rounded-md border border-line bg-white px-10 py-2.5 text-charcoal shadow-sm transition placeholder:text-midGray/70 hover:border-steel"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="admin-password" className="text-sm font-semibold text-navy">
                Contraseña
              </label>
              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-midGray"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  minLength={12}
                  className="focus-ring min-h-12 w-full rounded-md border border-line bg-white px-10 py-2.5 pr-12 text-charcoal shadow-sm transition placeholder:text-midGray/70 hover:border-steel"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="focus-ring absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-midGray transition hover:bg-skySurface hover:text-navy"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error ? (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || isRestoring}
              className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-orange px-4 py-2.5 font-semibold text-white shadow-orange transition hover:bg-[#C96513] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-5 border-t border-line pt-4 text-center text-xs font-semibold text-midGray">
            La sesión se cierra automáticamente tras 15 minutos de inactividad.
          </p>
        </section>
      </main>
    </>
  );
}
