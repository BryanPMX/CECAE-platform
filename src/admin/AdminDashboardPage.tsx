import { CalendarCheck, CalendarClock, FileText, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminEventsApi } from '@/services/admin.api';
import type { AdminEvent } from '@/services';
import { useAdminApi } from './useAdminApi';

export function AdminDashboardPage() {
  const adminRequest = useAdminApi();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    adminRequest((token) => adminEventsApi.list(token))
      .then((items) => {
        if (isMounted) setEvents(items);
      })
      .catch(() => {
        if (isMounted) setError('No fue posible cargar el resumen.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [adminRequest]);

  const metrics = useMemo(
    () => [
      { label: 'Total', value: events.length, icon: CalendarClock },
      { label: 'Publicados', value: events.filter((event) => event.status === 'published').length, icon: CalendarCheck },
      { label: 'Borradores', value: events.filter((event) => event.status === 'draft').length, icon: FileText },
      { label: 'Destacados', value: events.filter((event) => event.isFeatured).length, icon: Star },
    ],
    [events],
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-orange">Admin</p>
          <h1 className="font-display text-3xl font-bold text-navy">Panel de eventos</h1>
        </div>
        <Link
          to="/admin/eventos/nuevo"
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md bg-orange px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#C96513]"
        >
          Crear evento
        </Link>
      </div>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-midGray">{metric.label}</p>
              <metric.icon className="h-5 w-5 text-orange" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-navy">
              {isLoading ? '-' : metric.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-navy">Próximos cambios</h2>
          <Link to="/admin/eventos" className="focus-ring rounded-md px-3 py-2 text-sm font-semibold text-orange hover:text-navy">
            Ver todos
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {isLoading ? (
            <div className="h-20 animate-pulse rounded-md bg-skySurface" />
          ) : events.length ? (
            events.slice(0, 5).map((event) => (
              <Link
                key={event.id}
                to={`/admin/eventos/${event.id}/editar`}
                className="focus-ring grid gap-1 rounded-md border border-line px-4 py-3 transition hover:border-orange hover:bg-skySurface"
              >
                <span className="font-semibold text-navy">{event.title.es}</span>
                <span className="text-sm text-midGray">{event.date} · {event.status}</span>
              </Link>
            ))
          ) : (
            <p className="rounded-md bg-skySurface px-4 py-3 text-sm font-semibold text-navy">Todavía no hay eventos.</p>
          )}
        </div>
      </section>
    </div>
  );
}
