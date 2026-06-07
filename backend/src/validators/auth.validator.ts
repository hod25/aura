import { v } from './schema';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password strength policy. Mirrors the client-side rule (>= 8 chars and a
 * mix of letters and numbers) so the contract stays consistent end-to-end,
 * while the upper bound bounds bcrypt input cost.
 */
const password = v
  .string()
  .trim(false)
  .min(8)
  .max(128)
  .matches(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    'password must contain at least one letter and one number',
  );

/** Schema for `POST /api/auth/signup`. */
export const signupSchema = v.object({
  name: v.string().min(2).max(120),
  email: v.string().lowercase().max(255).matches(EMAIL_RE, 'email must be a valid email address'),
  password,
});

/** Schema for `POST /api/auth/login`. */
export const loginSchema = v.object({
  email: v.string().lowercase().max(255).matches(EMAIL_RE, 'email must be a valid email address'),
  // Login must not leak the strength policy, so only presence/length is checked.
  password: v.string().trim(false).min(1).max(128),
});
