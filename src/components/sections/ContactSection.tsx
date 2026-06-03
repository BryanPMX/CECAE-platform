import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile } from '@marsidev/react-turnstile';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { config, displayContact } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

type ServiceCopy = {
  title: string;
  description: string;
};

type ContactFormValues = {
  name: string;
  organization: string;
  phone: string;
  email: string;
  city: string;
  message: string;
  service?: string;
  modality?: string;
  size?: string;
};

export function ContactSection() {
  const { t } = useTranslation();
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'turnstile'>('idle');
  const services = t('services.items', { returnObjects: true }) as ServiceCopy[];
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('contact.form.required')),
        organization: z.string().min(2, t('contact.form.required')),
        phone: z
          .string()
          .min(7, t('contact.form.phoneInvalid'))
          .regex(/^[\d\s()+-]+$/, t('contact.form.phoneInvalid')),
        email: z.string().email(t('contact.form.emailInvalid')),
        city: z.string().min(2, t('contact.form.required')),
        message: z.string().min(8, t('contact.form.required')),
        service: z.string().optional(),
        modality: z.string().optional(),
        size: z.string().optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      modality: 'presencial',
      service: services[0]?.title,
    },
  });

  const hasTurnstile = Boolean(config.turnstileSiteKey);

  const onSubmit = (values: ContactFormValues) => {
    if (hasTurnstile && !turnstileToken) {
      setStatus('turnstile');
      return;
    }

    const message = [
      'Hola CECAE, me gustaría recibir información sobre sus capacitaciones.',
      `Nombre: ${values.name}`,
      `Organización: ${values.organization}`,
      `Teléfono: ${values.phone}`,
      `Correo: ${values.email}`,
      `Ciudad: ${values.city}`,
      `Servicio de interés: ${values.service ?? 'No especificado'}`,
      `Modalidad preferida: ${values.modality ?? 'No especificada'}`,
      values.size ? `Tamaño aproximado: ${values.size}` : '',
      `Mensaje: ${values.message}`,
    ]
      .filter(Boolean)
      .join('\n');

    trackEvent('form_submit', { channel: 'whatsapp' });
    setStatus('success');
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contacto" className="bg-surface py-24 sm:py-28">
      <div className="section-shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.55 }}
        >
          <SectionHeading eyebrow={t('contact.eyebrow')} title={t('contact.title')}>
            <p>{t('contact.subtitle')}</p>
          </SectionHeading>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 grid gap-4 rounded-[1.75rem] border border-line bg-white p-6 shadow-soft"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('contact.form.name')} error={errors.name?.message}>
                <input {...register('name')} autoComplete="name" className={inputClasses} />
              </Field>
              <Field label={t('contact.form.organization')} error={errors.organization?.message}>
                <input {...register('organization')} autoComplete="organization" className={inputClasses} />
              </Field>
              <Field label={t('contact.form.phone')} error={errors.phone?.message}>
                <input {...register('phone')} autoComplete="tel" className={inputClasses} />
              </Field>
              <Field label={t('contact.form.email')} error={errors.email?.message}>
                <input {...register('email')} autoComplete="email" className={inputClasses} />
              </Field>
              <Field label={t('contact.form.city')} error={errors.city?.message}>
                <input {...register('city')} autoComplete="address-level2" className={inputClasses} />
              </Field>
              <Field label={t('contact.form.service')}>
                <select {...register('service')} className={inputClasses}>
                  {services.map((service) => (
                    <option key={service.title} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('contact.form.modality')}>
                <select {...register('modality')} className={inputClasses}>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrida">Híbrida</option>
                </select>
              </Field>
              <Field label={t('contact.form.size')}>
                <input {...register('size')} className={inputClasses} />
              </Field>
            </div>
            <Field label={t('contact.form.message')} error={errors.message?.message}>
              <textarea {...register('message')} rows={5} className={cn(inputClasses, 'resize-y')} />
            </Field>

            <div className="rounded-md border border-line bg-skySurface p-3">
              {hasTurnstile ? (
                <Turnstile
                  siteKey={config.turnstileSiteKey}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken('')}
                  options={{ theme: 'light', language: 'es' }}
                />
              ) : (
                <p className="text-sm font-semibold text-navy">
                  {t('contact.form.turnstileMissing')}
                </p>
              )}
            </div>

            {status === 'turnstile' ? (
              <p className="text-sm font-semibold text-orange">
                {t('contact.form.turnstileRequired')}
              </p>
            ) : null}
            {status === 'success' ? (
              <p className="text-sm font-semibold text-steel">{t('contact.form.success')}</p>
            ) : null}

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-fit">
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {t('contact.form.submit')}
            </Button>
          </form>
        </motion.div>

        <aside className="grid gap-5">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="rounded-[1.75rem] border border-line bg-skySurface p-6 shadow-soft"
          >
            <h3 className="font-display text-2xl font-bold text-navy">{t('nav.contact')}</h3>
            <div className="mt-5 grid gap-3">
              <ContactLink
                icon={Phone}
                label={t('contact.methods.phone')}
                value={displayContact.phone}
                href={`tel:${config.phone}`}
                event="phone_click"
              />
              <ContactLink
                icon={MessageCircle}
                label={t('contact.methods.whatsapp')}
                value={displayContact.whatsapp}
                href={buildWhatsAppUrl('Hola, me gustaría recibir información sobre las capacitaciones profesionales de CECAE.')}
                event="whatsapp_click"
              />
              <ContactLink
                icon={Mail}
                label={t('contact.methods.email')}
                value={displayContact.email}
                href={`mailto:${config.email}`}
                event="email_click"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-soft"
          >
            <div className="flex items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold text-navy">
              <MapPin className="h-4 w-4 text-orange" aria-hidden="true" />
              Ciudad Juárez, Chihuahua
            </div>
            <iframe
              src={config.googleMapsEmbedUrl}
              title="Mapa de CECAE"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[360px] w-full"
            />
          </motion.div>
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-charcoal">
      {label}
      {children}
      {error ? <span className="text-xs font-semibold text-orange">{error}</span> : null}
    </label>
  );
}

function ContactLink({
  icon: Icon,
  label,
  value,
  href,
  event,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
  event: 'phone_click' | 'whatsapp_click' | 'email_click';
}) {
  return (
    <a
      href={href}
      target={href.startsWith('https') ? '_blank' : undefined}
      rel={href.startsWith('https') ? 'noreferrer' : undefined}
      onClick={() => trackEvent(event, { location: 'contact_card' })}
      className="focus-ring flex items-center gap-3 rounded-md bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-glow"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-midGray">
          {label}
        </span>
        <span className="font-semibold text-navy">{value}</span>
      </span>
    </a>
  );
}

const inputClasses =
  'focus-ring relative z-10 min-h-11 rounded-md border border-line bg-white px-3 py-2 text-base font-normal text-charcoal shadow-sm transition placeholder:text-midGray focus:border-orange';
