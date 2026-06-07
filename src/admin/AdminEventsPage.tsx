import { AlertTriangle, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminEventsApi } from '@/services/admin.api';
import type { AdminEvent, EventModality, EventStatus, EventType } from '@/services';
import { ApiError } from '@/services/apiClient';
import { cn } from '@/lib/utils';
import { adminErrorMessage } from './adminErrors';
import { useAdminApi } from './useAdminApi';

const eventTypeLabels: Record<EventType, string> = {
  training: 'Capacitación',
  webinar: 'Webinar',
  talk: 'Plática',
};

const eventModalityLabels: Record<EventModality, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrida: 'Híbrida',
};

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

type AdminNotice = {
  type: 'error' | 'success';
  message: string;
};

export function AdminEventsPage() {
  const adminRequest = useAdminApi();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<AdminEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | ''>('');

  const loadEvents = () => {
    setIsLoading(true);
    setNotice(null);
    adminRequest((token) => adminEventsApi.list(token))
      .then(setEvents)
      .catch((loadError) =>
        setNotice({
          type: 'error',
          message: adminErrorMessage(loadError, 'No fue posible cargar los eventos.'),
        }),
      )
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

  const confirmDeleteEvent = async () => {
    if (!pendingDeleteEvent) return;

    const event = pendingDeleteEvent;
    setDeletingEventId(event.id);
    setNotice(null);

    try {
      await adminRequest((token) => adminEventsApi.remove(token, event.id));
      setEvents((items) => items.filter((item) => item.id !== event.id));
      setNotice({
        type: 'success',
        message: `El evento "${event.title.es}" se eliminó del sitio público y del panel administrativo.`,
      });
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.status === 404) {
        setEvents((items) => items.filter((item) => item.id !== event.id));
        setNotice({
          type: 'success',
          message: `El evento "${event.title.es}" ya había sido eliminado. Actualizamos la lista administrativa.`,
        });
        return;
      }

      setNotice({
        type: 'error',
        message: adminErrorMessage(deleteError, 'No fue posible eliminar el evento.'),
      });
    } finally {
      setDeletingEventId(null);
      setPendingDeleteEvent(null);
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

      {notice ? <AdminNoticeMessage notice={notice} onRetry={notice.type === 'error' ? loadEvents : undefined} /> : null}

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
                    <td className="px-4 py-4 text-charcoal">{formatEventDate(event.date)}<br />{event.time}</td>
                    <td className="px-4 py-4 text-charcoal">{eventTypeLabels[event.type]}<br />{eventModalityLabels[event.modality]}</td>
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
                          onClick={() => setPendingDeleteEvent(event)}
                          disabled={Boolean(deletingEventId)}
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

      {pendingDeleteEvent ? (
        <DeleteEventDialog
          event={pendingDeleteEvent}
          isDeleting={deletingEventId === pendingDeleteEvent.id}
          onCancel={() => {
            if (!deletingEventId) setPendingDeleteEvent(null);
          }}
          onConfirm={() => void confirmDeleteEvent()}
        />
      ) : null}
    </div>
  );
}

function formatEventDate(value: string) {
  const parts = value.split('-');

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  return value;
}

function AdminNoticeMessage({
  notice,
  onRetry,
}: {
  notice: AdminNotice;
  onRetry?: () => void;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border px-3 py-2 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between',
        notice.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800',
      )}
      role={notice.type === 'error' ? 'alert' : 'status'}
    >
      <span>{notice.message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring w-fit rounded-md border border-current px-3 py-1 text-xs font-bold"
        >
          Actualizar lista
        </button>
      ) : null}
    </div>
  );
}

function DeleteEventDialog({
  event,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  event: AdminEvent;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-darkNavy/55 px-4 py-8">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-event-title"
        className="w-full max-w-lg rounded-lg border border-line bg-white p-5 shadow-soft"
      >
        <div className="flex gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-red-700">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 id="delete-event-title" className="font-display text-xl font-bold text-navy">
              Eliminar evento
            </h2>
            <p className="mt-2 text-sm leading-6 text-midGray">
              Esta acción quitará "{event.title.es}" del sitio público y marcará el evento como eliminado en el
              panel administrativo.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold text-navy hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar evento'}
          </button>
        </div>
      </section>
    </div>
  );
}
