import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = 'text', id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const isPassword = type === 'password';
    const [revealed, setRevealed] = useState(false);
    const resolvedType = isPassword && revealed ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-ink-900',
              'placeholder:text-ink-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              isPassword && 'pr-11',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-ink-200 focus:border-emerald-500 focus:ring-emerald-200',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              tabIndex={-1}
              aria-label={revealed ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-700"
            >
              {revealed ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {error ? (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs font-medium text-red-500"
          >
            {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
