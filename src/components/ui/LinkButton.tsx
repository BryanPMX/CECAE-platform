import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

type LinkButtonProps = LinkProps & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
};

const variants = {
  primary: 'bg-orange text-white shadow-orange hover:-translate-y-0.5 hover:bg-[#C96513]',
  secondary: 'bg-white text-navy shadow-glow hover:-translate-y-0.5 hover:text-orange',
  outline: 'border border-line bg-white text-navy hover:border-orange hover:text-orange',
  ghost: 'bg-transparent text-navy hover:bg-skySurface',
};

export function LinkButton({ className, variant = 'primary', ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(
        'focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
