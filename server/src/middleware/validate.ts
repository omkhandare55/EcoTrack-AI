import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

function formatZodErrors(error: ZodError): string[] {
  return error.errors.map((e) => {
    const path = e.path.join('.');
    return path ? `${path}: ${e.message}` : e.message;
  });
}

/**
 * Validate `req.body` against the given Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = formatZodErrors(err);
        next(new AppError(`Validation error: ${messages.join('; ')}`, 400));
        return;
      }
      next(err);
    }
  };
}

/**
 * Validate `req.query` against the given Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = formatZodErrors(err);
        next(new AppError(`Query validation error: ${messages.join('; ')}`, 400));
        return;
      }
      next(err);
    }
  };
}

/**
 * Validate `req.params` against the given Zod schema.
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.params);
      req.params = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = formatZodErrors(err);
        next(new AppError(`Params validation error: ${messages.join('; ')}`, 400));
        return;
      }
      next(err);
    }
  };
}
