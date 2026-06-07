import { forwardRef, type ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MotionImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
  > {
  src: string;
  alt?: string;
  /** Tailwind classes applied to the <img> element. */
  className?: string;
  /**
   * When true, hints the browser to fetch this asset eagerly with high
   * priority — use for above-the-fold hero imagery to cut LCP.
   */
  priority?: boolean;
}

/**
 * Lightweight, state-free image wrapper around `<motion.img>`.
 *
 * This is a pure client-side Vite SPA — there is no hydration boundary to guard
 * against, so the browser's native HTML pre-loader paints the asset on the very
 * first frame. We simply layer a hardware-accelerated opacity fade on top,
 * yielding an atomic single-pass render with zero double-render flash on
 * refresh. Props are spread straight onto the element so callers can pass
 * classes or custom behaviours freely.
 */
export const MotionImage = forwardRef<HTMLImageElement, MotionImageProps>(
  ({ src, alt = '', className, priority = false, ...props }, ref) => {
    // `fetchPriority` is applied through a loosely-typed object so the component
    // builds regardless of the installed @types/react version.
    const priorityAttrs = priority
      ? ({ fetchPriority: 'high', loading: 'eager' } as Record<string, string>)
      : ({ loading: 'lazy' } as Record<string, string>);

    return (
      <motion.img
        ref={ref}
        src={src}
        alt={alt}
        decoding="async"
        draggable={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: 'opacity' }}
        className={cn('h-full w-full object-cover', className)}
        {...priorityAttrs}
        {...props}
      />
    );
  },
);

MotionImage.displayName = 'MotionImage';
