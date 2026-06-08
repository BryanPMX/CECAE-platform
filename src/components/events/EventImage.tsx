import { CalendarDays, ImageOff } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type EventImageVariant = 'card' | 'detail';
type EventImageState = 'idle' | 'loaded' | 'error';
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
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [state, setState] = useState<EventImageState>(src ? 'idle' : 'error');
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const hasUsableImage = Boolean(src) && state !== 'error';
  const adaptiveAspectRatio = fitStrategy === 'adaptive' && naturalRatio ? naturalRatio : null;
  const shellStyle: CSSProperties | undefined = adaptiveAspectRatio
    ? { aspectRatio: `${adaptiveAspectRatio} / 1` }
    : undefined;

  const handleLoadedImage = useCallback((image: HTMLImageElement) => {
    if (!image.naturalWidth || !image.naturalHeight) return;
    setNaturalRatio(image.naturalWidth / image.naturalHeight);
    setState('loaded');
  }, []);

  useEffect(() => {
    setState(src ? 'idle' : 'error');
    setNaturalRatio(null);

    const frame = window.requestAnimationFrame(() => {
      const image = imageRef.current;
      if (src && image?.complete) handleLoadedImage(image);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [fitStrategy, handleLoadedImage, src]);

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
          <img
            ref={imageRef}
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
              fitStrategy === 'cover' ? 'object-cover' : 'object-contain',
              state === 'loaded' ? 'opacity-100' : 'opacity-0',
            )}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={(event) => handleLoadedImage(event.currentTarget)}
            onError={() => setState('error')}
          />
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
