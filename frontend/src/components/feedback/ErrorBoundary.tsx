import { Component, type ErrorInfo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback. When provided it replaces the default screen. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere in the subtree and shows a premium,
 * animated recovery screen instead of a blank white page.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface for diagnostics; a real app would forward this to a logger.
    console.error('Uncaught error:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-50 px-4">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl border border-ink-200/60 bg-white/80 p-10 text-center shadow-glass backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-50"
          >
            <AlertTriangle className="h-10 w-10 text-gold-600" />
          </motion.div>

          <h1 className="mt-6 font-display text-3xl font-semibold text-ink-900">
            Something went wrong
          </h1>
          <p className="mt-3 text-ink-500">
            An unexpected error interrupted your experience. Don&apos;t worry —
            your data is safe. Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex justify-center">
            <Button onClick={this.handleReset} size="lg">
              <RotateCcw className="h-4 w-4" />
              Return home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }
}
