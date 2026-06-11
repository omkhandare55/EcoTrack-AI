import { Request, Response, NextFunction } from 'express';

// Mock the env config BEFORE importing the module under test
const mockEnv = { NODE_ENV: 'test' as string };
jest.mock('../../config/env', () => ({
  env: mockEnv,
}));

import { AppError, catchAsync, globalErrorHandler } from '../../middleware/errorHandler';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockReq(): Partial<Request> {
  return {};
}

function mockRes(): Partial<Response> & { _status?: number; _json?: any } {
  const res: any = {
    _status: 0,
    _json: null,
  };
  res.status = jest.fn((code: number) => {
    res._status = code;
    return res;
  });
  res.json = jest.fn((body: any) => {
    res._json = body;
    return res;
  });
  return res;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('errorHandler module', () => {
  afterEach(() => {
    // Reset NODE_ENV after each test
    mockEnv.NODE_ENV = 'test';
  });

  // ───────────────────── AppError ─────────────────────

  describe('AppError', () => {
    it('should set statusCode, message, status "fail" for 4xx codes', () => {
      const err = new AppError('Not found', 404);
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Not found');
      expect(err.status).toBe('fail');
      expect(err.isOperational).toBe(true);
    });

    it('should set status "fail" for 400', () => {
      const err = new AppError('Bad request', 400);
      expect(err.status).toBe('fail');
      expect(err.statusCode).toBe(400);
      expect(err.isOperational).toBe(true);
    });

    it('should set status "error" for 500', () => {
      const err = new AppError('Internal error', 500);
      expect(err.status).toBe('error');
      expect(err.statusCode).toBe(500);
      expect(err.isOperational).toBe(true);
    });

    it('should set status "error" for 503', () => {
      const err = new AppError('Service unavailable', 503);
      expect(err.status).toBe('error');
    });

    it('should be an instance of Error', () => {
      const err = new AppError('test', 400);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
    });

    it('should have a stack trace', () => {
      const err = new AppError('test', 400);
      expect(err.stack).toBeDefined();
    });
  });

  // ───────────────────── catchAsync ─────────────────────

  describe('catchAsync', () => {
    it('should call next when the wrapped async function rejects', async () => {
      const error = new Error('async boom');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const next = jest.fn();

      const wrapped = catchAsync(asyncFn);
      await wrapped(mockReq() as Request, mockRes() as Response, next as NextFunction);

      // Wait for the promise rejection to propagate
      await new Promise((r) => setImmediate(r));

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call the wrapped function normally when it resolves', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const next = jest.fn();

      const wrapped = catchAsync(asyncFn);
      await wrapped(mockReq() as Request, mockRes() as Response, next as NextFunction);

      expect(asyncFn).toHaveBeenCalledTimes(1);
      // next should NOT have been called with an error
      expect(next).not.toHaveBeenCalled();
    });

    it('should pass req, res, next to the wrapped function', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const req = mockReq() as Request;
      const res = mockRes() as Response;
      const next = jest.fn() as unknown as NextFunction;

      const wrapped = catchAsync(asyncFn);
      await wrapped(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    });
  });

  // ───────────────────── globalErrorHandler ─────────────────────

  describe('globalErrorHandler', () => {
    let next: jest.Mock;

    beforeEach(() => {
      next = jest.fn();
    });

    it('should handle CastError and respond with 400', () => {
      const err: any = new Error('Cast failed');
      err.name = 'CastError';
      err.path = 'userId';

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json.message).toContain('Invalid value for userId');
    });

    it('should handle CastError without path', () => {
      const err: any = new Error('Cast failed');
      err.name = 'CastError';
      // no path property

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json.message).toContain('Invalid value for field');
    });

    it('should handle duplicate key error (code 11000) and respond with 409', () => {
      const err: any = new Error('Duplicate key');
      err.code = 11000;
      err.keyValue = { email: 'test@test.com' };

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res._json.message).toContain('Duplicate value for field: email');
    });

    it('should handle duplicate key error with multiple keys', () => {
      const err: any = new Error('Duplicate key');
      err.code = 11000;
      err.keyValue = { field1: 'a', field2: 'b' };

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res._json.message).toContain('field1, field2');
    });

    it('should handle ValidationError and respond with 400', () => {
      const err: any = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' },
      };

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json.message).toContain('Validation failed');
      expect(res._json.message).toContain('Name is required');
      expect(res._json.message).toContain('Email is invalid');
    });

    it('should handle JsonWebTokenError and respond with 401', () => {
      const err: any = new Error('jwt malformed');
      err.name = 'JsonWebTokenError';

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res._json.message).toContain('Invalid authentication token');
    });

    it('should handle TokenExpiredError and respond with 401', () => {
      const err: any = new Error('jwt expired');
      err.name = 'TokenExpiredError';

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res._json.message).toContain('Authentication token expired');
    });

    it('should include stack trace in development mode', () => {
      mockEnv.NODE_ENV = 'development';

      const err = new AppError('Dev error', 400);

      const res = mockRes();
      globalErrorHandler(err as any, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json.stack).toBeDefined();
      expect(res._json.error).toBeDefined();
      expect(res._json.message).toBe('Dev error');
    });

    it('should include status in development mode response', () => {
      mockEnv.NODE_ENV = 'development';

      const err = new AppError('Test', 422);

      const res = mockRes();
      globalErrorHandler(err as any, mockReq() as Request, res as Response, next as NextFunction);

      expect(res._json.status).toBe('fail');
    });

    it('should show operational error details in production mode', () => {
      mockEnv.NODE_ENV = 'production';

      const err = new AppError('Operational error', 400);

      const res = mockRes();
      globalErrorHandler(err as any, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json.message).toBe('Operational error');
      expect(res._json.stack).toBeUndefined();
    });

    it('should hide non-operational error details in production mode', () => {
      mockEnv.NODE_ENV = 'production';

      const err: any = new Error('Secret internal bug');
      // Generic errors are not operational (no isOperational flag)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const res = mockRes();
      globalErrorHandler(err, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res._json.message).toBe('Something went wrong. Please try again later.');
      expect(res._json.status).toBe('error');

      consoleSpy.mockRestore();
    });

    it('should default to statusCode 500 and status "error" for unknown errors', () => {
      // In non-development mode, unknown errors should get 500
      mockEnv.NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const err = new Error('Unknown');
      const res = mockRes();
      globalErrorHandler(err as any, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res._json.status).toBe('error');

      consoleSpy.mockRestore();
    });

    it('should handle AppError correctly in non-dev/non-prod (test) environment', () => {
      // test mode falls through to production logic path (not development)
      mockEnv.NODE_ENV = 'test';

      const err = new AppError('Test env error', 403);
      const res = mockRes();
      globalErrorHandler(err as any, mockReq() as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res._json.message).toBe('Test env error');
      expect(res._json.status).toBe('fail');
    });
  });
});
