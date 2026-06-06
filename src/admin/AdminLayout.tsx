import { CalendarDays, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAdminSession } from './useAdminSession';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
];

export function AdminLayout() {
  const { logout } = useAdminSession();

  return (
    <div className="min-h-screen bg-surface text-charcoal">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="focus-ring inline-flex items-center gap-3 rounded-md">
            <img
              src="/cecae-footer-logo-1024x256.png"
              alt="CECAE"
              width="1024"
              height="256"
              className="h-9 w-auto object-contain"
            />
            <span className="hidden items-center gap-2 rounded-md bg-skySurface px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-navy sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Admin
            </span>
          </Link>

          <nav className="flex justify-center gap-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'focus-ring inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition',
                    isActive ? 'bg-navy text-white shadow-sm' : 'text-charcoal hover:bg-skySurface hover:text-navy',
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void logout()}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-navy transition hover:border-orange hover:text-orange"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
