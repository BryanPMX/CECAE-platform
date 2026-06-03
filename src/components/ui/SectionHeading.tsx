import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
  inverse?: boolean;
  children?: React.ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  align = 'left',
  inverse = false,
  children,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl',
          inverse ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </h2>
      {children ? (
        <div className={cn('mt-4 text-base leading-7 sm:text-lg sm:leading-8', inverse ? 'text-white/72' : 'text-midGray')}>
          {children}
        </div>
      ) : null}
    </motion.div>
  );
}
