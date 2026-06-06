import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminEventsApi } from '@/services/admin.api';
import type { AdminEvent, EventStatus } from '@/services';
import { cn } from '@/lib/utils';
import { useAdminApi } from './useAdminApi';

const statusLabels: Record<EventStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

const statusClasses: Record<EventStatus, string> = {
  draft: 'bg-skySurface text-navy',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-slate-100 text-slate-700',
};

export function AdminEventsPage() {
  const adminRequest = useAdminApi();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | ''>('');

  const loadEvents = () => {
    setIsLoading(true);
    setError(null);
    adminRequest((token) => adminEventsApi.list(token))
      .then(setEvents)
      .catch(() => setError('No fue posible cargar los eventos.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesStatus = status ? event.status === status : true;
      const matchesSearch = query
        ? [event.title.es, event.title.en, event.description.es, event.description.en, event.location]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [events, search, status]);

  const deleteEvent = async (event: AdminEvent) => {
    const confirmed = window.confirm(`Eliminar "${event.title.es}"? Esta acción hará un borrado lógico.`);
    if (!confirmed) return;

    try {
      await adminRequest((token) => adminEventsApi.remove(token, event.id));
      setEvents((items) => items.filter((item) => item.id !== event.id));
    } catch {
      setError('No fue posible eliminar el evento.');
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-orange">Eventos</p>
          <h1 className="font-display text-3xl font-bold text-navy">Administrar eventos</h1>
        </div>
        <Link
          to="/admin/eventos/nuevo"
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-orange px-4 py-2 font-semibold text-white shadow-sm hover:bg-[#C96513]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nuevo evento
        </Link>
      </div>

      <section className="grid gap-4 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <label className="relative grid gap-2 text-sm font-semibold text-navy">
          Buscar
          <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-midGray" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="focus-ring min-h-11 rounded-md border border-line bg-white px-9 py-2 text-charcoal shadow-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-navy">
          Estado
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as EventStatus | '')}
            className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 py-2 text-charcoal shadow-sm"
          >
            <option value="">Todos</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
      </section>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-skySurface text-navy">
              <tr>
                <th className="px-4 py-3 font-bold">Evento</th>
                <th className="px-4 py-3 font-bold">Fecha</th>
                <th className="px-4 py-3 font-bold">Tipo</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3 font-bold">Destacado</th>
                <th className="px-4 py-3 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <div className="h-20 animate-pulse rounded-md bg-skySurface" />
                  </td>
                </tr>
              ) : filteredEvents.length ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="border-t border-line align-top">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-navy">{event.title.es}</p>
                      <p className="mt-1 line-clamp-2 max-w-md text-midGray">{event.description.es}</p>
                    </td>
                    <td className="px-4 py-4 text-charcoal">{event.date}<br />{event.time}</td>
                    <td className="px-4 py-4 text-charcoal">{event.type}<br />{event.modality}</td>
                    <td className="px-4 py-4">
                      <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-bold', statusClasses[event.status])}>
                        {statusLabels[event.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-charcoal">{event.isFeatured ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/eventos/${event.id}/editar`}
                          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-navy hover:border-orange hover:text-orange"
                          aria-label={`Editar ${event.title.es}`}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => void deleteEvent(event)}
                          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-red-700 hover:border-red-300 hover:bg-red-50"
                          aria-label={`Eliminar ${event.title.es}`}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center font-semibold text-midGray">
                    No hay eventos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
