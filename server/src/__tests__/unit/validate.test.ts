import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateQuery, validateParams } from '../../middleware/validate';
import { AppError } from '../../middleware/errorHandler';

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockReq(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    body: {},
    query: {} as any,
    params: {} as any,
    ...overrides,
  };
}

function mockRes(): Partial<Response> {
  return {};
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
  });

  describe('validate(schema) – req.body', () => {
    it('should call next() and assign parsed body when body is valid', () => {
      const req = mockReq({ body: { name: 'Alice', age: 30 } });
      const res = mockRes();

      const middleware = validate(schema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // no args = success
      expect(req.body).toEqual({ name: 'Alice', age: 30 });
    });

    it('should strip unknown keys via schema and assign parsed body', () => {
      const strictSchema = z.object({ name: z.string() }).strict();
      const req = mockReq({ body: { name: 'Bob' } });
      const res = mockRes();

      const middleware = validate(strictSchema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'Bob' });
    });

    it('should call next with AppError containing "Validation error" for invalid body', () => {
      const req = mockReq({ body: { name: '', age: -5 } });
      const res = mockRes();

      const middleware = validate(schema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toContain('Validation error');
      expect(err.statusCode).toBe(400);
    });

    it('should include field path in error message for nested errors', () => {
      const nestedSchema = z.object({
        address: z.object({ city: z.string().min(1) }),
      });
      const req = mockReq({ body: { address: { city: '' } } });
      const res = mockRes();

      const middleware = validate(nestedSchema);
      middleware(req as Request, res as Response, next as NextFunction);

      const err = next.mock.calls[0][0];
      expect(err.message).toContain('address.city');
    });

    it('should pass non-Zod errors directly to next', () => {
      // Create a schema whose parse method throws a generic error
      const badSchema = {
        parse: () => {
          throw new TypeError('Something unexpected');
        },
      } as unknown as z.ZodSchema;

      const req = mockReq({ body: { anything: true } });
      const res = mockRes();

      const middleware = validate(badSchema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(TypeError);
      expect(err.message).toBe('Something unexpected');
    });
  });

  describe('validateQuery(schema) – req.query', () => {
    const querySchema = z.object({
      page: z.coerce.number().int().positive(),
      limit: z.coerce.number().int().positive(),
    });

    it('should call next() and assign parsed query when query is valid', () => {
      const req = mockReq({ query: { page: '1', limit: '10' } as any });
      const res = mockRes();

      const middleware = validateQuery(querySchema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith();
      expect(req.query).toEqual({ page: 1, limit: 10 });
    });

    it('should call next with AppError containing "Query validation error" for invalid query', () => {
      const req = mockReq({ query: { page: 'abc', limit: '-1' } as any });
      const res = mockRes();

      const middleware = validateQuery(querySchema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toContain('Query validation error');
      expect(err.statusCode).toBe(400);
    });

    it('should pass non-Zod errors directly to next for query validation', () => {
      const badSchema = {
        parse: () => {
          throw new RangeError('Unexpected range');
        },
      } as unknown as z.ZodSchema;

      const req = mockReq({ query: {} as any });
      const res = mockRes();

      const middleware = validateQuery(badSchema);
      middleware(req as Request, res as Response, next as NextFunction);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(RangeError);
    });
  });

  describe('validateParams(schema) – req.params', () => {
    const paramsSchema = z.object({
      id: z.string().min(24, 'id must be 24 chars').max(24),
    });

    it('should call next() and assign parsed params when params are valid', () => {
      const id = '507f1f77bcf86cd799439011';
      const req = mockReq({ params: { id } as any });
      const res = mockRes();

      const middleware = validateParams(paramsSchema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith();
      expect(req.params).toEqual({ id });
    });

    it('should call next with AppError containing "Params validation error" for invalid params', () => {
      const req = mockReq({ params: { id: 'short' } as any });
      const res = mockRes();

      const middleware = validateParams(paramsSchema);
      middleware(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toContain('Params validation error');
      expect(err.statusCode).toBe(400);
    });

    it('should pass non-Zod errors directly to next for params validation', () => {
      const badSchema = {
        parse: () => {
          throw new Error('Generic error');
        },
      } as unknown as z.ZodSchema;

      const req = mockReq({ params: {} as any });
      const res = mockRes();

      const middleware = validateParams(badSchema);
      middleware(req as Request, res as Response, next as NextFunction);

      const err = next.mock.calls[0][0];
      expect(err).not.toBeInstanceOf(AppError);
      expect(err.message).toBe('Generic error');
    });
  });
});
