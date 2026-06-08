import { CalendarDays, ImageOff, Maximize2, Minimize2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type EventImageVariant = 'card' | 'detail';
type EventImageState = 'idle' | 'loaded' | 'error';
type EventImageFit = 'cover' | 'contain';
type EventImageFitStrategy = 'adaptive' | 'cover';

const imageShellClasses: Record<EventImageVariant, string> = {
  card: 'aspect-[16/9]',
  detail: 'aspect-[16/9] max-h-[70vh] min-h-[16rem] sm:min-h-[20rem]',
};

const detailAspectRatioLimits = {
  min: 1.05,
  max: 2.2,
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
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const hasUsableImage = Boolean(src) && state !== 'error';
  const isDetail = variant === 'detail';
  const detailAspectRatio =
    isDetail && naturalRatio
      ? Math.min(detailAspectRatioLimits.max, Math.max(detailAspectRatioLimits.min, naturalRatio))
      : null;
  const showImageBackdrop = hasUsableImage && state === 'loaded';
  const canToggleFit = isDetail && fitStrategy === 'adaptive' && state === 'loaded';
  const shellStyle: CSSProperties | undefined = detailAspectRatio
    ? { aspectRatio: `${detailAspectRatio} / 1` }
    : undefined;

  useEffect(() => {
    setState(src ? 'idle' : 'error');
    setFit('cover');
    setNaturalRatio(null);
  }, [fitStrategy, src]);

  return (
    <div
      className={cn(
        'relative isolate w-full overflow-hidden bg-white',
        imageShellClasses[variant],
        className,
      )}
      style={shellStyle}
    >
      {hasUsableImage ? (
        <>
          {state === 'idle' ? <div className="absolute inset-0 animate-pulse bg-skySurface" /> : null}
          {showImageBackdrop ? (
            <img
              src={src}
              alt=""
              aria-hidden="true"
              className={cn(
                'absolute inset-0 h-full w-full scale-110 object-cover blur-2xl',
                isDetail ? 'opacity-45 saturate-125' : 'opacity-30',
              )}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : null}
          {showImageBackdrop ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/72 via-white/18 to-navy/16" />
          ) : null}
          <img
            src={src}
            alt={title ? `Imagen de ${title}` : ''}
            width="1600"
            height="900"
            sizes={
              variant === 'detail'
                ? '(min-width: 768px) 768px, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
            }
            className={cn(
              'relative z-10 h-full w-full transition-opacity duration-300',
              fit === 'cover' ? 'object-cover' : 'object-contain p-2 sm:p-3',
              state === 'loaded' ? 'opacity-100' : 'opacity-0',
            )}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              const ratio = naturalWidth / naturalHeight;
              setNaturalRatio(ratio);
              setFit(fitStrategy === 'adaptive' && (ratio < 1.35 || ratio > 2.35) ? 'contain' : 'cover');
              setState('loaded');
            }}
            onError={() => setState('error')}
          />
          {fit === 'cover' ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/2 bg-gradient-to-t from-navy/28 to-transparent" />
          ) : null}
          {canToggleFit ? (
            <button
              type="button"
              className="focus-ring absolute right-3 top-3 z-30 inline-grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/88 text-navy shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-orange"
              title={fit === 'cover' ? 'Ver imagen completa' : 'Llenar espacio'}
              aria-label={fit === 'cover' ? 'Ver imagen completa' : 'Llenar espacio'}
              onClick={() => setFit((currentFit) => (currentFit === 'cover' ? 'contain' : 'cover'))}
            >
              {fit === 'cover' ? (
                <Minimize2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
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
