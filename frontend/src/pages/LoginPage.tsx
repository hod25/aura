import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/features/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { validateEmail } from '@/lib/validation';

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/catalog';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: FieldErrors = {
      email: validateEmail(email),
      password: password ? undefined : 'Password is required.',
    };
    setErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      notify('Welcome back to Aura');
      navigate(from, { replace: true });
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Unable to sign in.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your curated experience."
      footer={
        <>
          New to Aura?{' '}
          <Link
            to="/signup"
            className="font-semibold text-emerald-700 transition-colors hover:text-emerald-600"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <div className="mt-2 text-right">
            <Link
              to="/login"
              className="text-xs font-medium text-ink-400 transition-colors hover:text-ink-700"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          variant="secondary"
          isLoading={submitting}
        >
          Sign in
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 rounded-xl bg-ink-100/70 px-4 py-3 text-center text-xs text-ink-400">
        Demo backend not running? Use any valid-looking credentials — the UI
        gracefully handles offline state.
      </p>
    </AuthLayout>
  );
}
