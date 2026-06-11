import Goal from '../models/Goal';
import type { IGoal } from '../types';
import { BaseRepository } from './BaseRepository';

export class GoalRepository extends BaseRepository<IGoal> {
  constructor() {
    super(Goal);
  }

  /**
   * All goals for a user (newest first).
   */
  async findByUserId(userId: string): Promise<IGoal[]> {
    return Goal.find({ userId }).sort({ createdAt: -1 }).lean<IGoal[]>().exec();
  }

  /**
   * Only active goals for a user.
   */
  async findActiveGoals(userId: string): Promise<IGoal[]> {
    return Goal.find({ userId, status: 'active' }).sort({ createdAt: -1 }).lean<IGoal[]>().exec();
  }

  /**
   * Update progress on a goal.
   */
  async updateProgress(goalId: string, currentValue: number): Promise<IGoal | null> {
    return Goal.findByIdAndUpdate(goalId, { currentValue }, { new: true, runValidators: true })
      .lean<IGoal>()
      .exec();
  }
}

export const goalRepository = new GoalRepository();
