import { AppError } from '../utils/AppError';

/**
 * Lightweight, dependency-free validation helpers used at the controller
 * boundary. They normalize untrusted input and throw 400 AppErrors with
 * clear messages on failure.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireString(
  value: unknown,
  field: string,
  opts: { min?: number; max?: number } = {},
): string {
  if (typeof value !== 'string') {
    throw AppError.badRequest(`${field} must be a string`);
  }
  const trimmed = value.trim();
  const min = opts.min ?? 1;
  if (trimmed.length < min) {
    throw AppError.badRequest(`${field} must be at least ${min} character(s)`);
  }
  if (opts.max !== undefined && trimmed.length > opts.max) {
    throw AppError.badRequest(`${field} must be at most ${opts.max} character(s)`);
  }
  return trimmed;
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, 'email', { max: 255 }).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw AppError.badRequest('email must be a valid email address');
  }
  return email;
}

export function requirePassword(value: unknown): string {
  if (typeof value !== 'string') {
    throw AppError.badRequest('password must be a string');
  }
  if (value.length < 8) {
    throw AppError.badRequest('password must be at least 8 characters');
  }
  if (value.length > 128) {
    throw AppError.badRequest('password must be at most 128 characters');
  }
  return value;
}

export function requirePositiveInt(value: unknown, field: string): number {
  const num =
    typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  if (!Number.isInteger(num) || num <= 0) {
    throw AppError.badRequest(`${field} must be a positive integer`);
  }
  return num;
}

export function optionalPositiveNumber(
  value: unknown,
  field: string,
): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const num = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isNaN(num) || num < 0) {
    throw AppError.badRequest(`${field} must be a non-negative number`);
  }
  return num;
}

export function parsePagination(
  query: Record<string, unknown>,
): { page: number; limit: number } {
  let page = Number.parseInt(String(query.page ?? '1'), 10);
  let limit = Number.parseInt(String(query.limit ?? '20'), 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  return { page, limit };
}
