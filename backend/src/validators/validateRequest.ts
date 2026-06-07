import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ObjectSchema, ObjectShape } from './schema';
import { AppError } from '../utils/AppError';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Builds an Express middleware that validates a part of the request against
 * a declarative schema. On success the parsed/coerced values replace the
 * original request part; on failure a 400 `AppError` is thrown carrying the
 * full list of field errors (rendered by the central error handler as
 * `{ success: false, error: { message, details } }`).
 */
function makeValidator(part: RequestPart) {
  return <S extends ObjectShape>(schema: ObjectSchema<S>): RequestHandler => {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.validate(req[part]);
      if (!result.success) {
        throw AppError.badRequest('Validation failed', result.errors);
      }
      // `query`/`params` getters are read-only on some Express versions, so
      // assign individual keys rather than reassigning the container.
      if (part === 'body') {
        req.body = result.data;
      } else {
        Object.assign(req[part], result.data);
      }
      next();
    };
  };
}

export const validateBody = makeValidator('body');
export const validateQuery = makeValidator('query');
export const validateParams = makeValidator('params');
