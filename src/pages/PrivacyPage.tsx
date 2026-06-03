import { useTranslation } from 'react-i18next';
import { PageShell } from '@/components/layout/PageShell';
import { Seo } from '@/components/layout/Seo';

type PrivacySection = {
  title: string;
  body: string;
};

export function PrivacyPage() {
  const { t } = useTranslation();
  const sections = t('privacy.sections', { returnObjects: true }) as PrivacySection[];

  return (
    <PageShell>
      <Seo
        title="Aviso de privacidad | CECAE"
        description="Aviso de privacidad de CECAE conforme a datos de contacto recopilados en el sitio."
        path="/aviso-de-privacidad"
      />
      <section className="page-hero">
        <div className="section-shell max-w-4xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">
            CECAE
          </p>
          <h1 className="text-balance mt-3 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            {t('privacy.title')}
          </h1>
          <p className="text-pretty mt-5 max-w-3xl text-base leading-7 text-white/76 sm:text-lg sm:leading-8">
            {t('privacy.intro')}
          </p>
        </div>
      </section>

      <section className="bg-surface py-12 sm:py-16 lg:py-20">
        <div className="section-shell max-w-4xl">
          <div className="mt-10 grid gap-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-lg border border-line bg-white p-6 shadow-sm">
                <h2 className="text-balance font-display text-2xl font-bold text-navy">{section.title}</h2>
                <p className="text-pretty mt-3 leading-7 text-midGray">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
