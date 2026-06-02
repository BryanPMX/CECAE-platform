import { Menu, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

const links = [
  ['/', 'nav.home'],
  ['/eventos', 'nav.events'],
  ['/contacto', 'nav.contact'],
] as const;

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: 'es' | 'en') => {
    void i18n.changeLanguage(language);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-xl">
      <nav className="section-shell grid h-20 items-center grid-cols-[auto_1fr_auto] gap-4">
        <div className="flex items-center justify-start">
          <Link to="/" className="focus-ring shrink-0 rounded-md" aria-label="CECAE">
            <img
              src="/cecae-footer-logo-1024x256.png"
              alt="CECAE"
              className="h-10 w-auto object-contain sm:h-12"
            />
          </Link>
        </div>

        <div className="hidden justify-center lg:flex lg:gap-1">
          {links.map(([href, label]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                cn(
                  'focus-ring rounded-md px-3 py-2 text-sm font-semibold transition',
                  isActive ? 'text-navy' : 'text-charcoal hover:text-orange',
                )
              }
            >
              {t(label)}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center justify-end gap-3 lg:flex">
          <LanguageToggle current={i18n.language} onChange={changeLanguage} />
          <Link
            to="/contacto#contacto"
            onClick={() => trackEvent('cta_click', { location: 'navbar' })}
            className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-orange px-4 py-2 text-sm font-semibold text-white shadow-orange transition hover:-translate-y-0.5 hover:bg-[#C96513]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {t('nav.cta')}
          </Link>
        </div>

        <div className="flex items-center justify-end lg:hidden">
          <Button
            variant="ghost"
            className="h-11 w-11 px-0"
            onClick={() => setIsOpen((value) => !value)}
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <div className="section-shell grid gap-2 py-5">
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setIsOpen(false)}
                  className="focus-ring rounded-md px-3 py-3 font-semibold text-charcoal hover:bg-skySurface"
                >
                  {t(label)}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between gap-3">
                <LanguageToggle current={i18n.language} onChange={changeLanguage} />
                <Link
                  to="/contacto#contacto"
                  onClick={() => {
                    setIsOpen(false);
                    trackEvent('cta_click', { location: 'mobile_navbar' });
                  }}
                  className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-orange px-4 py-2 text-sm font-semibold text-white"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  {t('nav.cta')}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function LanguageToggle({
  current,
  onChange,
}: {
  current: string;
  onChange: (language: 'es' | 'en') => void;
}) {
  return (
    <div
      className="grid grid-cols-2 rounded-md border border-line bg-white p-1"
      role="group"
      aria-label="Language"
    >
      {(['es', 'en'] as const).map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => onChange(language)}
          className={cn(
            'focus-ring rounded px-3 py-1.5 text-xs font-bold uppercase transition',
            current.startsWith(language) ? 'bg-navy text-white' : 'text-midGray hover:text-navy',
          )}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
