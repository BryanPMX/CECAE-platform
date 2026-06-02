import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone } from 'lucide-react';
import { config, displayContact } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-navy text-white">
      <div className="section-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <img
            src="/cecae-footer-logo-2048x512.png"
            alt="CECAE"
            className="h-14 w-auto rounded bg-white object-contain px-3 sm:h-16"
          />
          <p className="mt-5 max-w-xl text-lg text-white/82">{t('footer.tagline')}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <MapPin className="h-4 w-4 text-orange" aria-hidden="true" />
            {t('footer.location')}
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <a
            href={`tel:${config.phone}`}
            onClick={() => trackEvent('phone_click', { location: 'footer' })}
            className="focus-ring inline-flex items-center gap-3 rounded-md py-1 text-white/82 hover:text-white"
          >
            <Phone className="h-4 w-4 text-orange" aria-hidden="true" />
            {displayContact.phone}
          </a>
          <a
            href={`mailto:${config.email}`}
            onClick={() => trackEvent('email_click', { location: 'footer' })}
            className="focus-ring inline-flex items-center gap-3 rounded-md py-1 text-white/82 hover:text-white"
          >
            <Mail className="h-4 w-4 text-orange" aria-hidden="true" />
            {displayContact.email}
          </a>
          <Link
            to="/aviso-de-privacidad"
            className="focus-ring mt-3 inline-flex w-fit rounded-md py-1 text-white/82 hover:text-white"
          >
            {t('footer.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
