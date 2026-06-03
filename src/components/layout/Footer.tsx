import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { config, displayContact } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-navy text-white">
      <div className="section-shell grid gap-10 py-12 lg:grid-cols-[1.5fr_1fr_1fr] lg:py-14">
        <div className="space-y-6">
          <img
            src="/cecae-footer-logo-2048x512.png"
            alt="CECAE"
            className="h-14 w-auto rounded bg-white object-contain px-3 sm:h-16"
          />
          <p className="text-pretty max-w-xl text-base leading-7 text-white/82 sm:text-[1.0625rem]">
            {t('footer.tagline')}
          </p>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <MapPin className="h-4 w-4 text-orange" aria-hidden="true" />
            {t('footer.location')}
          </p>
          <Link
            to="/contacto"
            className="focus-ring inline-flex items-center justify-center rounded-md bg-orange px-4 py-2 text-sm font-semibold text-white shadow-orange transition hover:bg-[#C96513]"
          >
            {t('nav.contact')}
          </Link>
        </div>

        <div className="grid gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            {t('footer.navigation')}
          </p>
          <nav className="grid gap-2 text-sm text-white/80">
            <Link to="/" className="focus-ring rounded-md px-3 py-2 transition hover:text-white">
              {t('nav.home')}
            </Link>
            <Link to="/eventos" className="focus-ring rounded-md px-3 py-2 transition hover:text-white">
              {t('nav.events')}
            </Link>
            <Link to="/contacto" className="focus-ring rounded-md px-3 py-2 transition hover:text-white">
              {t('nav.contact')}
            </Link>
            <Link to="/aviso-de-privacidad" className="focus-ring rounded-md px-3 py-2 transition hover:text-white">
              {t('footer.privacy')}
            </Link>
          </nav>
        </div>

        <div className="grid gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            {t('footer.contact')}
          </p>
          <a
            href={`tel:${config.phone}`}
            onClick={() => trackEvent('phone_click', { location: 'footer' })}
            className="focus-ring inline-flex items-center gap-3 rounded-md py-2 text-sm text-white/82 transition hover:text-white"
          >
            <Phone className="h-4 w-4 text-orange" aria-hidden="true" />
            {displayContact.phone}
          </a>
          <a
            href={`mailto:${config.email}`}
            onClick={() => trackEvent('email_click', { location: 'footer' })}
            className="focus-ring inline-flex items-center gap-3 rounded-md py-2 text-sm text-white/82 transition hover:text-white"
          >
            <Mail className="h-4 w-4 text-orange" aria-hidden="true" />
            {displayContact.email}
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="section-shell flex flex-col gap-4 text-sm leading-6 text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CECAE. {t('footer.rights')}</p>
          <p>{t('footer.summary')}</p>
        </div>
      </div>
    </footer>
  );
}
