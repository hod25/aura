import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-7xl font-medium gradient-gold-text">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink-900">
          This page wandered off
        </h1>
        <p className="mt-2 text-ink-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="mt-8">
          <Button>Return home</Button>
        </Link>
      </div>
    </PageTransition>
  );
}
