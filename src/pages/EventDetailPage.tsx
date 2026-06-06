import { ArrowLeft, Calendar, Clock, ExternalLink, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EventImage } from '@/components/events/EventImage';
import { Seo } from '@/components/layout/Seo';
import { eventsService, type CecaeEvent } from '@/services';

export function EventDetailPage() {
  const { id } = useParams();
  const { i18n, t } = useTranslation();
  const language = i18n.language.startsWith('en') ? 'en' : 'es';
  const [event, setEvent] = useState<CecaeEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    eventsService
      .getEventById(id)
      .then((item) => {
        if (isMounted) setEvent(item);
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
  }, [id]);

  return (
    <>
      <Seo
        title={event ? `${event.title.es} | CECAE` : 'Detalle de evento CECAE'}
        description={event?.description.es ?? 'Detalle de evento CECAE.'}
        path={`/eventos/${id ?? ''}`}
      />
      <section className="bg-surface py-12 sm:py-16 lg:py-20">
        <div className="section-shell max-w-3xl text-center">
          <Link
            to="/eventos"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md font-semibold text-orange hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('events.title')}
          </Link>
          {isLoading ? (
            <div className="mt-8 h-96 animate-pulse rounded-lg bg-white shadow-soft" />
          ) : error || !event ? (
            <div className="mt-8 rounded-lg border border-line bg-white p-6 shadow-soft sm:p-8">
              <h1 className="font-display text-3xl font-bold text-navy">Evento no disponible</h1>
              <p className="mt-3 text-midGray">{error ?? 'El evento solicitado no está publicado o no existe.'}</p>
            </div>
          ) : (
            <article className="mt-8 overflow-hidden rounded-lg border border-line bg-white text-left shadow-soft">
              <EventImage src={event.imageUrl} title={event.title[language]} variant="detail" eager />
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-orange px-3 py-1 text-xs font-bold text-white">
                    {t(`events.filters.${event.type}`)}
                  </span>
                  <span className="rounded-full bg-skySurface px-3 py-1 text-xs font-bold text-navy">
                    {t(`events.filters.${event.modality}`)}
                  </span>
                </div>
                <h1 className="text-balance mt-4 font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">
                  {event.title[language]}
                </h1>
                <p className="text-pretty mt-4 text-base leading-7 text-midGray sm:text-lg sm:leading-8">
                  {event.description[language]}
                </p>
                <dl className="mt-6 grid gap-3 text-sm text-charcoal sm:grid-cols-2">
                  <DetailItem icon={Calendar} label="Fecha" value={formatDate(event.date, language)} />
                  <DetailItem icon={Clock} label="Hora" value={`${event.time}${event.duration ? ` · ${event.duration}` : ''}`} />
                  {event.location ? <DetailItem icon={MapPin} label="Ubicación" value={event.location} /> : null}
                  {event.capacity ? <DetailItem icon={Users} label="Capacidad" value={`${event.capacity} personas`} /> : null}
                </dl>
                {event.tags?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-midGray">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {event.registrationUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-orange px-5 py-2 font-semibold text-white shadow-orange hover:bg-[#C96513]"
                  >
                    Registro
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </article>
          )}
        </div>
      </section>
    </>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-md bg-skySurface p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange" aria-hidden="true" />
      <div>
        <dt className="font-bold text-navy">{label}</dt>
        <dd className="mt-0.5 text-midGray">{value}</dd>
      </div>
    </div>
  );
}

function formatDate(value: string, language: 'es' | 'en') {
  return new Intl.DateTimeFormat(language === 'es' ? 'es-MX' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(`${value}T00:00:00`));
}
