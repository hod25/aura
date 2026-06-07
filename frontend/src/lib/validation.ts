/** Lightweight client-side validators for form fields. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address.';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Use both letters and numbers.';
  }
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return 'Name is required.';
  if (value.trim().length < 2) return 'Name is too short.';
  return undefined;
}

export function validateRequired(
  value: string,
  label: string,
): string | undefined {
  return value.trim() ? undefined : `${label} is required.`;
}

export function validateConfirm(
  value: string,
  original: string,
): string | undefined {
  if (!value) return 'Please confirm your password.';
  if (value !== original) return 'Passwords do not match.';
  return undefined;
}
