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
      <section className="py-20 sm:py-24">
        <div className="section-shell max-w-4xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">
            CECAE
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-navy">{t('privacy.title')}</h1>
          <p className="mt-5 text-lg leading-8 text-midGray">{t('privacy.intro')}</p>
          <div className="mt-10 grid gap-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-lg border border-line bg-white p-6">
                <h2 className="font-display text-2xl font-bold text-navy">{section.title}</h2>
                <p className="mt-3 leading-7 text-midGray">{section.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
