import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { catchAsync } from '../middleware/errorHandler';
import { env } from '../config/env';

// Cookie options for security
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiration format)
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.register(name, email, password);

  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);

  res.cookie('token', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    },
  });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  // User is already attached to request by auth middleware
  const user = req.user!;
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    },
  });
});
