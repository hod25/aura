import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types';
import { AppError } from './AppError';

/** Signs a JWT for the given subject. */
export function signToken(payload: AuthPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwt.secret, options);
}

/** Verifies and decodes a JWT, throwing a 401 on any failure. */
export function verifyToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as unknown;
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof (decoded as AuthPayload).sub === 'number' &&
      typeof (decoded as AuthPayload).email === 'string'
    ) {
      return decoded as AuthPayload;
    }
    throw AppError.unauthorized('Invalid token payload');
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}
