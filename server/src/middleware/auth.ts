import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import User from '../models/User';
import type { JwtPayload } from '../types';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Try HTTP-only cookie first
    if (req.cookies?.token) {
      token = req.cookies.token as string;
    }

    // 2. Fallback to Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to access this resource.', 401),
      );
    }

    // 3. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // 4. Check if user still exists
    const user = await User.findById(decoded.id).select('+passwordHash');
    if (!user) {
      return next(new AppError('The user associated with this token no longer exists.', 401));
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    next(err);
  }
}
