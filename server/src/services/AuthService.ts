import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { userRepository } from '../repositories/UserRepository';
import type { IUser, JwtPayload } from '../types';

export class AuthService {
  /**
   * Register a new user in the database, hash their password, and return the user profile with a signed JWT.
   * @param name - The full name of the user.
   * @param email - The email address of the user.
   * @param password - The raw password to be hashed.
   * @returns A promise resolving to the created user document and signed JWT token.
   * @throws {AppError} If an account with the provided email already exists.
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
   * Authenticate a user with email and password, and return their profile with a signed JWT.
   * @param email - The email address of the user.
   * @param password - The raw password to verify.
   * @returns A promise resolving to the authenticated user document and signed JWT token.
   * @throws {AppError} If email is not found or password does not match.
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
   * Sign a JSON Web Token (JWT) with the provided user ID payload.
   * @param userId - The user ID to include in the payload.
   * @returns A signed JWT string token.
   */
  generateToken(userId: string): string {
    const payload: JwtPayload = { id: userId };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Retrieve the current authenticated user's profile by ID.
   * @param userId - The ID of the user to fetch.
   * @returns A promise resolving to the user document (excluding passwordHash).
   * @throws {AppError} If the user does not exist in the database.
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
