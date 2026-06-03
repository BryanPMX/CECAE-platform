import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { config, displayContact } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-navy text-white">
      <div className="section-shell py-6 text-center lg:py-7 lg:text-left">
        <div className="flex flex-col items-center gap-5 lg:grid lg:grid-cols-[1.15fr_0.9fr_1fr] lg:items-start lg:gap-5">
          <div className="flex flex-col items-center gap-2.5 lg:order-1 lg:items-start">
            <img
              src="/cecae-footer-logo-2048x512.png"
              alt="CECAE"
              className="h-12 w-auto rounded bg-white object-contain px-3 sm:h-14"
            />
            <p className="text-pretty max-w-md text-sm leading-6 text-white/82 sm:text-base lg:max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="grid justify-center gap-1.5 lg:order-2 lg:justify-items-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              {t('footer.navigation')}
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/80">
              <Link to="/" className="focus-ring rounded-md px-3 py-1.5 transition hover:text-white">
                {t('nav.home')}
              </Link>
              <Link to="/eventos" className="focus-ring rounded-md px-3 py-1.5 transition hover:text-white">
                {t('nav.events')}
              </Link>
              <Link to="/contacto" className="focus-ring rounded-md px-3 py-1.5 transition hover:text-white">
                {t('nav.contact')}
              </Link>
            </nav>
          </div>

          <div className="grid justify-center gap-1.5 lg:order-3 lg:justify-self-end lg:justify-items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              {t('footer.contact')}
            </p>
            <div className="flex flex-col items-start gap-1.5">
              <a
                href={`tel:${config.phone}`}
                onClick={() => trackEvent('phone_click', { location: 'footer' })}
                className="focus-ring inline-flex min-w-[15rem] items-center gap-3 rounded-md py-1.5 text-left text-sm text-white/82 transition hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-orange" aria-hidden="true" />
                {displayContact.phone}
              </a>
              <a
                href={`mailto:${config.email}`}
                onClick={() => trackEvent('email_click', { location: 'footer' })}
                className="focus-ring inline-flex min-w-[15rem] items-center gap-3 rounded-md py-1.5 text-left text-sm text-white/82 transition hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-orange" aria-hidden="true" />
                {displayContact.email}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5 text-center text-sm text-white/70 lg:mt-6 lg:grid lg:grid-cols-[1.15fr_0.9fr_1fr] lg:items-center lg:text-left">
          <p className="flex items-center justify-center gap-2 lg:justify-start">
            <MapPin className="h-4 w-4 shrink-0 text-orange" aria-hidden="true" />
            {t('footer.location')}
          </p>
          <Link to="/aviso-de-privacidad" className="focus-ring rounded-md px-3 py-1.5 transition hover:text-white lg:justify-self-center">
            {t('footer.privacy')}
          </Link>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="section-shell flex flex-col gap-4 text-sm leading-6 text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CECAE. Todos los derechos reservados.</p>
          <p>Formación empresarial para cumplir con la NOM-035 y desarrollar talento.</p>
        </div>
      </div>
    </footer>
  );
}
