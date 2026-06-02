import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Seo } from '@/components/layout/Seo';

export function EventDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <PageShell>
      <Seo
        title="Detalle de evento CECAE"
        description="Ruta preparada para los detalles de eventos CECAE en la versión V2."
        path={`/eventos/${id ?? ''}`}
      />
      <section className="py-20 sm:py-24">
        <div className="section-shell max-w-3xl">
          <Link
            to="/eventos"
            className="focus-ring inline-flex items-center gap-2 rounded-md font-semibold text-orange hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('events.title')}
          </Link>
          <div className="mt-8 rounded-lg border border-line bg-skySurface p-8">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-orange">
              /eventos/{id}
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold text-navy">
              {t('events.title')}
            </h1>
            <p className="mt-4 text-lg leading-8 text-midGray">{t('events.detailStub')}</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
