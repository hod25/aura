import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

/**
 * Requires a valid `Authorization: Bearer <token>` header and attaches the
 * decoded identity to `req.user`.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw AppError.unauthorized('Authorization header with Bearer token is required');
  }

  const token = header.slice('Bearer '.length).trim();
  if (token.length === 0) {
    throw AppError.unauthorized('Bearer token is empty');
  }

  req.user = verifyToken(token);
  next();
}
