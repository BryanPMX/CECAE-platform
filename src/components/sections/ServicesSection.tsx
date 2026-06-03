import { motion } from 'framer-motion';
import { Brain, ClipboardCheck, Handshake, MessagesSquare, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { trackEvent } from '@/lib/analytics';

type ServiceCopy = {
  title: string;
  description: string;
};

const icons = [Brain, ClipboardCheck, UsersRound, Handshake, MessagesSquare];

export function ServicesSection() {
  const { t } = useTranslation();
  const services = t('services.items', { returnObjects: true }) as ServiceCopy[];

  return (
    <section id="capacitaciones" className="flow-section flow-section-dark py-20 sm:py-24 lg:py-28">
      <div className="section-shell">
        <div className="section-spotlight border border-line bg-white/[0.92] p-6 shadow-soft sm:p-8 lg:p-10">
          <SectionHeading
            eyebrow={t('services.eyebrow')}
            title={t('services.title')}
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => {
              const Icon = icons[index] ?? ClipboardCheck;
              return (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="group flex min-h-[276px] flex-col items-center rounded-lg border border-line bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-orange hover:shadow-glow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-skySurface text-steel transition group-hover:bg-orange group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-balance mt-5 font-display text-xl font-bold leading-snug text-navy">
                    {service.title}
                  </h3>
                  <p className="text-pretty mt-3 flex-1 text-left text-[0.95rem] leading-7 text-midGray sm:text-base">
                    {service.description}
                  </p>
                  <Link
                    to="/contacto#contacto"
                    onClick={() =>
                      trackEvent('cta_click', { location: 'service_card', service: service.title })
                    }
                    className="focus-ring mx-auto mt-5 inline-flex w-fit rounded-md font-semibold text-orange hover:text-navy"
                  >
                    {t('services.cta')}
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
