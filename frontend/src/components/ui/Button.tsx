import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-ink-900 shadow-soft',
  secondary:
    'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-600 shadow-glow-emerald',
  gold: 'bg-gold-500 text-ink-950 hover:bg-gold-400 focus-visible:ring-gold-500 shadow-glow-gold',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 focus-visible:ring-ink-300',
  outline:
    'bg-transparent text-ink-900 border border-ink-300 hover:border-ink-900 hover:bg-ink-50 focus-visible:ring-ink-400',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base py-3.5',
};

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'btn',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || isLoading}
        {...(props as unknown as HTMLMotionProps<'button'>)}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
