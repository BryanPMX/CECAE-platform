import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  align?: 'left' | 'center';
  level?: 1 | 2;
  inverse?: boolean;
  children?: React.ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  level = 2,
  inverse = false,
  children,
}: SectionHeadingProps) {
  const HeadingTag = level === 1 ? 'h1' : 'h2';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="mx-auto max-w-3xl text-center"
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">
        {eyebrow}
      </p>
      <HeadingTag
        className={cn(
          'text-balance mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]',
          inverse ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </HeadingTag>
      {children ? (
        <div className={cn('text-pretty mx-auto mt-4 max-w-[66ch] text-base leading-7 sm:text-[1.0625rem] sm:leading-8', inverse ? 'text-white/72' : 'text-midGray')}>
          {children}
        </div>
      ) : null}
    </motion.div>
  );
}
