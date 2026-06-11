import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { userRepository } from '../repositories/UserRepository';
import type { IUser, JwtPayload } from '../types';

export class AuthService {
  /**
   * Register a new user, return user object + signed JWT.
   */
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<{ user: IUser; token: string }> {
    // Check for existing email
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const user = await userRepository.createUser({ name, email, password });
    const token = this.generateToken(user._id.toString());

    return { user, token };
  }

  /**
   * Authenticate with email + password, return user object + signed JWT.
   */
  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = this.generateToken(user._id.toString());

    return { user, token };
  }

  /**
   * Sign a JWT with the user's ID.
   */
  generateToken(userId: string): string {
    const payload: JwtPayload = { id: userId };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Retrieve current user by ID (without password).
   */
  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }
}

export const authService = new AuthService();
