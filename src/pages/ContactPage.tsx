import { ContactSection } from '@/components/sections/ContactSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { PageShell } from '@/components/layout/PageShell';
import { Seo } from '@/components/layout/Seo';

export function ContactPage() {
  return (
    <PageShell>
      <Seo
        title="Contacto CECAE | Solicita información"
        description="Contacta a CECAE para capacitación, NOM-035, bienestar psicosocial y desarrollo organizacional."
        path="/contacto"
      />
      <ContactSection />
      <FaqSection />
    </PageShell>
  );
}
