import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import {
  validateConfirm,
  validateEmail,
  validateName,
  validatePassword,
} from '@/lib/validation';
import { cn } from '@/lib/utils';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

function passwordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] ?? 'Too weak' };
}

export function SignupPage() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const validate = (): boolean => {
    const next: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirm(confirm, password),
    };
    setErrors(next);
    return !next.name && !next.email && !next.password && !next.confirm && agree;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (!agree) notify('Please accept the terms to continue.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      notify('Your Aura account is ready');
      navigate('/catalog', { replace: true });
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Unable to create account.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const strengthColors = [
    'bg-ink-200',
    'bg-red-400',
    'bg-gold-400',
    'bg-emerald-400',
    'bg-emerald-600',
  ];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Aura for a more considered way to shop."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-700 transition-colors hover:text-emerald-600"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {password && !errors.password && (
            <div className="mt-2">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i <= strength.score
                        ? strengthColors[strength.score]
                        : 'bg-ink-200',
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-ink-400">
                Strength: {strength.label}
              </p>
            </div>
          )}
        </div>
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <button
          type="button"
          onClick={() => setAgree((v) => !v)}
          className="flex items-start gap-3 text-left"
        >
          <span
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
              agree
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-ink-300 bg-white',
            )}
          >
            {agree && <Check className="h-3.5 w-3.5" />}
          </span>
          <span className="text-xs leading-relaxed text-ink-500">
            I agree to Aura&apos;s{' '}
            <span className="font-medium text-ink-700 underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="font-medium text-ink-700 underline">
              Privacy Policy
            </span>
            .
          </span>
        </button>

        <Button
          type="submit"
          fullWidth
          size="lg"
          variant="secondary"
          isLoading={submitting}
        >
          Create account
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
