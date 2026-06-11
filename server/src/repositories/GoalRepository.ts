import Goal from '../models/Goal';
import type { IGoal } from '../types';
import { BaseRepository } from './BaseRepository';

export class GoalRepository extends BaseRepository<IGoal> {
  constructor() {
    super(Goal);
  }

  /**
   * Retrieves all goals associated with a specific user, sorted by creation date descending.
   *
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to an array of goal documents.
   */
  async findByUserId(userId: string): Promise<IGoal[]> {
    return Goal.find({ userId }).sort({ createdAt: -1 }).lean<IGoal[]>().exec();
  }

  /**
   * Retrieves all active goals associated with a specific user, sorted by creation date descending.
   *
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to an array of active goal documents.
   */
  async findActiveGoals(userId: string): Promise<IGoal[]> {
    return Goal.find({ userId, status: 'active' }).sort({ createdAt: -1 }).lean<IGoal[]>().exec();
  }

  /**
   * Updates the current reduction percentage value on a goal.
   *
   * @param goalId - The unique ID of the goal.
   * @param currentValue - The current reduction progress percentage.
   * @returns A promise resolving to the updated goal document, or null if not found.
   */
  async updateProgress(goalId: string, currentValue: number): Promise<IGoal | null> {
    return Goal.findByIdAndUpdate(goalId, { currentValue }, { new: true, runValidators: true })
      .lean<IGoal>()
      .exec();
  }
}

export const goalRepository = new GoalRepository();
