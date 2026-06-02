import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido">{children}</main>
      <Footer />
    </div>
  );
}
