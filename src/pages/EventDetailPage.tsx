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
      <section className="bg-surface py-16 sm:py-20 lg:py-24">
        <div className="section-shell max-w-3xl text-center">
          <Link
            to="/eventos"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md font-semibold text-orange hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('events.title')}
          </Link>
          <div className="mt-8 rounded-lg border border-line bg-white p-6 text-center shadow-soft sm:p-8">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-orange">
              /eventos/{id}
            </p>
            <h1 className="text-balance mt-4 font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">
              {t('events.title')}
            </h1>
            <p className="text-pretty mt-4 text-left text-base leading-7 text-midGray sm:text-lg sm:leading-8">
              {t('events.detailStub')}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
