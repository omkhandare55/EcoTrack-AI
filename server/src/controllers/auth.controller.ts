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

/**
 * Controller endpoint to register a new user in the application.
 * Signs a JWT token and places it into an HTTP-only secure cookie.
 *
 * @route POST /api/v1/auth/register
 * @access Public
 * @param req - Express request object containing registration payload (name, email, password).
 * @param res - Express response object.
 * @returns A promise resolving to the registered user profile.
 * @throws {AppError} 409 if the email address is already registered.
 */
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

/**
 * Controller endpoint to authenticate an existing user.
 * Signs a JWT token and places it into an HTTP-only secure cookie.
 *
 * @route POST /api/v1/auth/login
 * @access Public
 * @param req - Express request object containing email and password.
 * @param res - Express response object.
 * @returns A promise resolving to the authenticated user profile.
 * @throws {AppError} 401 if authentication fails.
 */
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

/**
 * Controller endpoint to log out the user by clearing their session cookie.
 *
 * @route POST /api/v1/auth/logout
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to a success message.
 */
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

/**
 * Controller endpoint to retrieve the current user's profile info.
 *
 * @route GET /api/v1/auth/me
 * @access Private
 * @param req - Express request containing the pre-verified user attachment.
 * @param res - Express response object.
 * @returns A promise resolving to the user profile details.
 */
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
