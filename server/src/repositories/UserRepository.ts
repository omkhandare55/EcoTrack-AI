import User from '../models/User';
import type { IUser } from '../types';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  /**
   * Finds a user document by their email address.
   * Explicitly includes the `passwordHash` field, which is excluded from standard queries by default.
   * 
   * @param email - The email address of the user.
   * @returns A promise resolving to the user document, or null if not found.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  }

  /**
   * Inserts a new user document into the database.
   * Password hashing is automatically handled by the pre-save schema hook.
   * 
   * @param data - The user registration data containing name, email, and password.
   * @returns A promise resolving to the created user document.
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
