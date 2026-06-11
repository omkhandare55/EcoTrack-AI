import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import User from '../../models/User';
import { env } from '../../config/env';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      cookies: {},
      headers: {},
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate successfully when valid token is in cookie', async () => {
    req.cookies = { token: 'valid-cookie-token' };

    (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
    
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      select: jest.fn().mockResolvedValue({ _id: 'user123', name: 'John Doe' }),
    };
    (User.findById as jest.Mock).mockReturnValue(mockUser);

    await authenticate(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-cookie-token', env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalledWith();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should authenticate successfully when valid token is in Authorization header', async () => {
    req.headers = { authorization: 'Bearer valid-header-token' };

    (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });

    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      select: jest.fn().mockResolvedValue({ _id: 'user123', name: 'John Doe' }),
    };
    (User.findById as jest.Mock).mockReturnValue(mockUser);

    await authenticate(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-header-token', env.JWT_SECRET);
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('should fail if no token is provided in cookie or headers', async () => {
    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toContain('not logged in');
  });

  it('should fail if user associated with token no longer exists', async () => {
    req.cookies = { token: 'some-token' };
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'deleted-user' });
    
    const mockUser = {
      select: jest.fn().mockResolvedValue(null),
    };
    (User.findById as jest.Mock).mockReturnValue(mockUser);

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toContain('no longer exists');
  });

  it('should fail with 401 when token is invalid', async () => {
    req.cookies = { token: 'invalid-token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid signature');
    });

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toContain('Invalid token');
  });

  it('should fail with 401 when token is expired', async () => {
    req.cookies = { token: 'expired-token' };
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date());
    });

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = (next as jest.Mock).mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toContain('session has expired');
  });

  it('should pass other verification errors to next', async () => {
    req.cookies = { token: 'error-token' };
    const randomError = new Error('Random error');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw randomError;
    });

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(randomError);
  });
});
