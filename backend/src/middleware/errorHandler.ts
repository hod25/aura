import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/** 404 handler for unmatched routes. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error-handling middleware. Converts thrown errors into a
 * consistent JSON envelope and hides internal details in production.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Surface unexpected (non-operational) errors to the server logs.
  if (statusCode >= 500) {
    logger.error('unhandled request error', err);
  }

  const body: Record<string, unknown> = {
    success: false,
    error: {
      message: statusCode >= 500 && env.isProduction ? 'Internal server error' : message,
    },
  };

  if (details !== undefined && !(statusCode >= 500 && env.isProduction)) {
    (body.error as Record<string, unknown>).details = details;
  }

  res.status(statusCode).json(body);
}
