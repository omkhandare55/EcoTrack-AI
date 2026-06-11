import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// ─── Custom Error ───────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Catch Async ────────────────────────────────────────────────────────────

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function catchAsync(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

// ─── Global Error Handler ───────────────────────────────────────────────────

interface MongooseDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

interface MongooseValidationError extends Error {
  errors: Record<string, { message: string }>;
}

function handleCastError(err: Error & { path?: string }): AppError {
  return new AppError(`Invalid value for ${err.path ?? 'field'}`, 400);
}

function handleDuplicateKey(err: MongooseDuplicateKeyError): AppError {
  const field = Object.keys(err.keyValue).join(', ');
  return new AppError(`Duplicate value for field: ${field}. Please use a different value.`, 409);
}

function handleValidationError(err: MongooseValidationError): AppError {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
}

function handleJwtError(): AppError {
  return new AppError('Invalid authentication token. Please log in again.', 401);
}

function handleJwtExpired(): AppError {
  return new AppError('Authentication token expired. Please log in again.', 401);
}

export function globalErrorHandler(
  err: Error & {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    code?: number;
    keyValue?: Record<string, unknown>;
    path?: string;
    errors?: Record<string, { message: string }>;
  },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let error = err;

  if (err.name === 'CastError') error = handleCastError(err);
  if ((err as unknown as MongooseDuplicateKeyError).code === 11000)
    error = handleDuplicateKey(err as unknown as MongooseDuplicateKeyError);
  if (err.name === 'ValidationError')
    error = handleValidationError(err as unknown as MongooseValidationError);
  if (err.name === 'JsonWebTokenError') error = handleJwtError();
  if (err.name === 'TokenExpiredError') error = handleJwtExpired();

  const statusCode = (error as AppError).statusCode || 500;
  const status = (error as AppError).status || 'error';
  const isOperational = (error as AppError).isOperational || false;

  if (env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status,
      message: error.message,
      stack: error.stack,
      error,
    });
    return;
  }

  // Production: only send operational error details
  if (isOperational) {
    res.status(statusCode).json({
      status,
      message: error.message,
    });
    return;
  }

  // Programming / unknown error – don't leak details
  console.error('💥  UNEXPECTED ERROR:', error);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
}
