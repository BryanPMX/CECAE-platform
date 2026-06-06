import { CalendarDays, ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type EventImageVariant = 'card' | 'detail';
type EventImageState = 'idle' | 'loaded' | 'error';
type EventImageFit = 'cover' | 'contain';
type EventImageFitStrategy = 'adaptive' | 'cover';

const imageShellClasses: Record<EventImageVariant, string> = {
  card: 'aspect-[16/9]',
  detail: 'aspect-[16/9]',
};

export function EventImage({
  src,
  title,
  variant = 'card',
  className,
  eager = false,
  fitStrategy = 'adaptive',
}: {
  src?: string;
  title?: string;
  variant?: EventImageVariant;
  className?: string;
  eager?: boolean;
  fitStrategy?: EventImageFitStrategy;
}) {
  const [state, setState] = useState<EventImageState>(src ? 'idle' : 'error');
  const [fit, setFit] = useState<EventImageFit>('cover');
  const hasUsableImage = Boolean(src) && state !== 'error';

  useEffect(() => {
    setState(src ? 'idle' : 'error');
    setFit('cover');
  }, [fitStrategy, src]);

  return (
    <div
      className={cn(
        'relative isolate w-full overflow-hidden bg-skySurface',
        imageShellClasses[variant],
        className,
      )}
    >
      {hasUsableImage ? (
        <>
          {state === 'idle' ? <div className="absolute inset-0 animate-pulse bg-skySurface" /> : null}
          {fitStrategy === 'cover' && state === 'loaded' ? (
            <img
              src={src}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : null}
          <img
            src={src}
            alt={title ? `Imagen de ${title}` : ''}
            width="1600"
            height="900"
            sizes={variant === 'detail' ? '(min-width: 768px) 768px, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
            className={cn(
              'relative z-10 h-full w-full transition-opacity duration-300',
              fit === 'cover' ? 'object-cover' : 'object-contain p-3',
              state === 'loaded' ? 'opacity-100' : 'opacity-0',
            )}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              const ratio = naturalWidth / naturalHeight;
              setFit(fitStrategy === 'adaptive' && (ratio < 1.35 || ratio > 2.35) ? 'contain' : 'cover');
              setState('loaded');
            }}
            onError={() => setState('error')}
          />
          {fitStrategy === 'cover' ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-t from-navy/28 to-transparent" />
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center p-5 text-center">
          <div className="grid justify-items-center gap-2 text-midGray">
            {src ? (
              <ImageOff className="h-8 w-8 text-orange" aria-hidden="true" />
            ) : (
              <CalendarDays className="h-8 w-8 text-orange" aria-hidden="true" />
            )}
            <span className="text-xs font-bold uppercase tracking-[0.14em]">
              {src ? 'Imagen no disponible' : 'Evento CECAE'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
