import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MotionImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'onLoad' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  > {
  src: string;
  alt?: string;
  /** Tailwind classes applied to the <img> element. */
  className?: string;
  /** Tailwind classes for the placeholder layer shown until the asset loads. */
  placeholderClassName?: string;
  /**
   * When true, hints the browser to fetch this asset eagerly with high
   * priority — use for above-the-fold hero imagery to cut LCP.
   */
  priority?: boolean;
}

/**
 * Progressive image with a shimmering placeholder and a hardware-accelerated
 * 600ms opacity fade-in once the asset finishes decoding.
 *
 * The placeholder occupies the same box as the image, so layout never shifts
 * (zero CLS) while the asset streams in — even under heavy network throttling.
 */
export function MotionImage({
  src,
  alt = '',
  className,
  placeholderClassName,
  priority = false,
  ...rest
}: MotionImageProps) {
  const [loaded, setLoaded] = useState(false);

  // `isMounted` flips to true only after the client-side React hydration is
  // 100% complete. Until then the <img> carries no `src`, so the browser's
  // native HTML pre-loader cannot paint the asset before Framer Motion's
  // zero-opacity baseline is in place — this eliminates the refresh FOUC.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cached assets may already be decoded before React attaches `onLoad`;
  // reconcile on mount via the ref callback to avoid a stuck placeholder.
  const reconcile = (node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  };

  // `fetchPriority` is applied through a loosely-typed object so the component
  // builds regardless of the installed @types/react version.
  const priorityAttrs = priority
    ? ({ fetchPriority: 'high', loading: 'eager' } as Record<string, string>)
    : ({ loading: 'lazy' } as Record<string, string>);

  return (
    <span className="absolute inset-0 block overflow-hidden">
      {/* Blurred/shimmer placeholder — reserves the box, prevents CLS. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 bg-ink-100 transition-opacity duration-700 ease-out',
          loaded ? 'opacity-0' : 'skeleton opacity-100',
          placeholderClassName,
        )}
      />

      <motion.img
        ref={reconcile}
        src={isMounted ? src : undefined}
        alt={alt}
        onLoad={() => setLoaded(true)}
        decoding="async"
        draggable={false}
        initial={false}
        animate={{ opacity: isMounted && loaded ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: 'opacity' }}
        className={cn('h-full w-full object-cover', className)}
        {...priorityAttrs}
        {...rest}
      />
    </span>
  );
}
