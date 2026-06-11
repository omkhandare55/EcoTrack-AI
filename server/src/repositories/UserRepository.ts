import User from '../models/User';
import type { IUser } from '../types';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Find a user by email. Includes passwordHash for authentication.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  /**
   * Create a new user. Password hashing is handled by the model pre-save hook.
   */
  async createUser(data: { name: string; email: string; password: string }): Promise<IUser> {
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.password, // hashed by pre-save hook
    });
    return user.toObject() as IUser;
  }
}

export const userRepository = new UserRepository();
