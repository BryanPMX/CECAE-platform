import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from 'react-i18next';

export function PageShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <a href="#contenido" className="skip-link">
        {t('nav.skip')}
      </a>
      <Navbar />
      <main id="contenido">{children}</main>
      <Footer />
    </div>
  );
}
