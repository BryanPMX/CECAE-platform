import { AboutSection } from '@/components/sections/AboutSection';
import { EventsPreviewSection } from '@/components/sections/EventsPreviewSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { MethodologySection } from '@/components/sections/MethodologySection';
import { NomSection } from '@/components/sections/NomSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { PageShell } from '@/components/layout/PageShell';
import { Seo } from '@/components/layout/Seo';

export function HomePage() {
  return (
    <PageShell>
      <Seo
        title="CECAE | Capacitaciones profesionales en Ciudad Juárez"
        description="Capacitaciones empresariales en Ciudad Juárez para bienestar psicosocial, NOM-035, liderazgo, comunicación y desarrollo organizacional."
      />
      <HeroSection />
      <div className="home-flow">
        <AboutSection />
        <ServicesSection />
        <NomSection />
        <MethodologySection />
        <EventsPreviewSection />
      </div>
    </PageShell>
  );
}
