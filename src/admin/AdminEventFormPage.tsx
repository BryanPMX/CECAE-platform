import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminEventsApi } from '@/services/admin.api';
import type { AdminEvent, EventModality, EventPayload, EventStatus, EventType } from '@/services';
import { ApiError } from '@/services/apiClient';
import { useAdminApi } from './useAdminApi';

type EventFormState = {
  titleEs: string;
  descriptionEs: string;
  type: EventType;
  modality: EventModality;
  date: string;
  time: string;
  duration: string;
  location: string;
  capacity: string;
  registrationUrl: string;
  imageUrl: string;
  tags: string;
  isFeatured: boolean;
  status: EventStatus;
};

const emptyForm: EventFormState = {
  titleEs: '',
  descriptionEs: '',
  type: 'training',
  modality: 'presencial',
  date: '',
  time: '',
  duration: '',
  location: '',
  capacity: '',
  registrationUrl: '',
  imageUrl: '',
  tags: '',
  isFeatured: false,
  status: 'draft',
};

export function AdminEventFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const adminRequest = useAdminApi();
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    adminRequest((token) => adminEventsApi.get(token, id))
      .then((event) => {
        if (isMounted) setForm(formFromEvent(event));
      })
      .catch(() => {
        if (isMounted) setError('No fue posible cargar el evento.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [adminRequest, id]);

  const title = isEditing ? 'Editar evento' : 'Crear evento';
  const canSubmit = useMemo(
    () => form.titleEs && form.descriptionEs && form.date && form.time,
    [form],
  );

  const update = <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = payloadFromForm(form);
      if (id) {
        await adminRequest((token) => adminEventsApi.update(token, id, payload));
      } else {
        await adminRequest((token) => adminEventsApi.create(token, payload));
      }
      navigate('/admin/eventos');
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'No fue posible guardar el evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/admin/eventos" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-orange hover:text-navy">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Eventos
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy">{title}</h1>
        </div>
      </div>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6">
          <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold text-navy">Contenido</h2>
            <div className="mt-5 grid gap-5">
              <TextField label="Título" value={form.titleEs} onChange={(value) => update('titleEs', value)} required />
              <TextArea label="Descripción" value={form.descriptionEs} onChange={(value) => update('descriptionEs', value)} required />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold text-navy">Detalles del evento</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <SelectField label="Tipo" value={form.type} onChange={(value) => update('type', value as EventType)}>
                <option value="training">Capacitación</option>
                <option value="webinar">Webinar</option>
                <option value="talk">Plática</option>
              </SelectField>
              <SelectField label="Modalidad" value={form.modality} onChange={(value) => update('modality', value as EventModality)}>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hibrida">Híbrida</option>
              </SelectField>
              <SelectField label="Estado" value={form.status} onChange={(value) => update('status', value as EventStatus)}>
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </SelectField>
              <TextField label="Fecha" type="date" value={form.date} onChange={(value) => update('date', value)} required />
              <TextField label="Hora" type="time" value={form.time} onChange={(value) => update('time', value)} required />
              <TextField label="Duración" value={form.duration} onChange={(value) => update('duration', value)} placeholder="Ej. 2 horas" />
              <TextField label="Ubicación" value={form.location} onChange={(value) => update('location', value)} />
              <TextField label="Capacidad" type="number" min="1" value={form.capacity} onChange={(value) => update('capacity', value)} />
              <TextField label="Etiquetas" value={form.tags} onChange={(value) => update('tags', value)} placeholder="NOM-035, Seguridad" />
              <TextField label="URL de registro" type="url" value={form.registrationUrl} onChange={(value) => update('registrationUrl', value)} />
              <TextField label="URL de imagen" type="url" value={form.imageUrl} onChange={(value) => update('imageUrl', value)} />
              <label className="flex min-h-11 items-center gap-3 rounded-md border border-line bg-skySurface px-3 py-2 text-sm font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) => update('isFeatured', event.target.checked)}
                  className="h-4 w-4 accent-orange"
                />
                Destacar en el sitio público
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-orange px-5 py-2 font-semibold text-white shadow-sm hover:bg-[#C96513] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Guardando...' : 'Guardar evento'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-navy">
      {label}
      <input
        type={type}
        value={value}
        min={min}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 py-2 text-charcoal shadow-sm"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-navy">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={6}
        className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-charcoal shadow-sm"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-navy">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring min-h-11 rounded-md border border-line bg-white px-3 py-2 text-charcoal shadow-sm"
      >
        {children}
      </select>
    </label>
  );
}

function formFromEvent(event: AdminEvent): EventFormState {
  return {
    titleEs: event.title.es,
    descriptionEs: event.description.es,
    type: event.type,
    modality: event.modality,
    date: event.date,
    time: event.time,
    duration: event.duration ?? '',
    location: event.location ?? '',
    capacity: event.capacity ? String(event.capacity) : '',
    registrationUrl: event.registrationUrl ?? '',
    imageUrl: event.imageUrl ?? '',
    tags: event.tags?.join(', ') ?? '',
    isFeatured: Boolean(event.isFeatured),
    status: event.status,
  };
}

function payloadFromForm(form: EventFormState): EventPayload {
  const tags = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    title: {
      es: form.titleEs.trim(),
      en: form.titleEs.trim(),
    },
    description: {
      es: form.descriptionEs.trim(),
      en: form.descriptionEs.trim(),
    },
    type: form.type,
    modality: form.modality,
    date: form.date,
    time: form.time,
    duration: optionalString(form.duration),
    location: optionalString(form.location),
    capacity: form.capacity ? Number(form.capacity) : undefined,
    registrationUrl: optionalString(form.registrationUrl),
    imageUrl: optionalString(form.imageUrl),
    tags: tags.length ? tags : undefined,
    isFeatured: form.isFeatured,
    status: form.status,
  };
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
