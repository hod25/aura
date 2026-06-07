import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

const sizes: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

/** Atomic loading indicator. Prefer skeleton loaders for content regions. */
export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2"
    >
      <Loader2
        className={cn('animate-spin text-ink-400', sizes[size], className)}
        aria-hidden
      />
      {label ? (
        <span className="text-sm text-ink-500">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </span>
  );
}
