import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  /** Sliding window length in milliseconds. */
  windowMs: number;
  /** Maximum allowed requests per key within the window. */
  max: number;
  /** Optional label used in logs and error messages. */
  name?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory fixed-window rate limiter.
 *
 * Dependency-free and suitable for a single-instance deployment or as a
 * first line of defence against brute-force attacks (e.g. on auth routes).
 * For multi-instance horizontal scaling, back this with a shared store
 * (Redis) — the middleware contract would remain unchanged.
 */
export function rateLimit(options: RateLimitOptions): RequestHandler {
  const { windowMs, max, name = 'rate-limit' } = options;
  const buckets = new Map<string, Bucket>();

  // Periodically evict expired buckets so memory does not grow unbounded.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, windowMs);
  // Do not keep the event loop alive solely for the sweeper.
  if (typeof sweeper.unref === 'function') sweeper.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = clientKey(req);
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, max - bucket.count);
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(retryAfter));
      logger.warn('rate limit exceeded', { name, key, path: req.originalUrl });
      throw new AppError(
        429,
        'Too many requests. Please try again later.',
        { retryAfterSeconds: retryAfter },
      );
    }

    next();
  };
}

/** Derives the throttle key from the trusted client IP. */
function clientKey(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

/**
 * Stricter limiter for authentication endpoints to blunt credential
 * brute-forcing: 10 attempts per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  max: 10,
});
