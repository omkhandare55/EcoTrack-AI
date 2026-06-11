import { AppError } from '../middleware/errorHandler';
import { goalRepository } from '../repositories/GoalRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import type { IGoal } from '../types';
import type { CreateGoalInput, UpdateGoalInput } from '../validators/goal.validator';

export class GoalService {
  /**
   * Creates a new emission reduction goal for a user.
   * Computes a baseline using the user's historical emissions for the selected category 
   * over the corresponding period (e.g., last 7 days for a weekly goal).
   * 
   * @param userId - The unique ID of the user creating the goal.
   * @param data - The goal creation payload (title, category, target reduction, period, etc.).
   * @returns A promise resolving to the created goal document.
   * @throws {AppError} If goal parameters are invalid.
   */
  async createGoal(userId: string, data: CreateGoalInput): Promise<IGoal> {
    const now = new Date();
    const startDate = data.startDate ? new Date(data.startDate) : now;
    const endDate = data.endDate
      ? new Date(data.endDate)
      : this.computeEndDate(startDate, data.period);

    // Calculate baseline: average emissions for the category over the past period
    const baselineDays = this.periodToDays(data.period);
    const baselineStart = new Date(startDate);
    baselineStart.setDate(baselineStart.getDate() - baselineDays);

    const baselineValue = await activityRepository.getTotalEmissions(
      userId,
      baselineStart,
      startDate,
    );

    const goal = await goalRepository.create({
      userId: userId as unknown as IGoal['userId'],
      title: data.title,
      category: data.category,
      targetReduction: data.targetReduction,
      currentValue: 0,
      baselineValue,
      period: data.period,
      status: 'active',
      startDate,
      endDate,
    } as Partial<IGoal>);

    return goal;
  }

  /**
   * Retrieves all goals associated with a specific user, sorted newest first.
   * 
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to an array of goal documents.
   */
  async getGoals(userId: string): Promise<IGoal[]> {
    return goalRepository.findByUserId(userId);
  }

  /**
   * Updates an existing goal's attributes after verifying user ownership.
   * 
   * @param userId - The unique ID of the authenticated user.
   * @param goalId - The unique ID of the goal to update.
   * @param data - The partial goal fields to update.
   * @returns A promise resolving to the updated goal document.
   * @throws {AppError} 404 if goal is not found, 403 if user is not authorized, or 500 on database update failure.
   */
  async updateGoal(userId: string, goalId: string, data: UpdateGoalInput): Promise<IGoal> {
    const goal = await goalRepository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found.', 404);
    }
    if (goal.userId.toString() !== userId) {
      throw new AppError('You do not have permission to update this goal.', 403);
    }

    const updated = await goalRepository.updateById(goalId, data);
    if (!updated) {
      throw new AppError('Failed to update goal.', 500);
    }
    return updated;
  }

  /**
   * Deletes an existing goal after verifying user ownership.
   * 
   * @param userId - The unique ID of the authenticated user.
   * @param goalId - The unique ID of the goal to delete.
   * @returns A promise resolving when the goal has been successfully deleted.
   * @throws {AppError} 404 if goal is not found, or 403 if user is not authorized.
   */
  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goal = await goalRepository.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found.', 404);
    }
    if (goal.userId.toString() !== userId) {
      throw new AppError('You do not have permission to delete this goal.', 403);
    }
    await goalRepository.deleteById(goalId);
  }

  /**
   * Recalculates progress for all active goals of a user.
   * Compares baseline emissions with current emissions in the goal's timeframe to update
   * the completion percentage, and updates the status to 'completed' or 'failed' if bounds are reached.
   * 
   * @param userId - The unique ID of the user.
   * @returns A promise resolving when all active goals' progress is updated.
   */
  async updateGoalProgress(userId: string): Promise<void> {
    const activeGoals = await goalRepository.findActiveGoals(userId);

    for (const goal of activeGoals) {
      const currentEmissions = await activityRepository.getTotalEmissions(
        userId,
        goal.startDate,
        new Date(),
      );

      // Reduction percentage achieved
      const reductionAchieved =
        goal.baselineValue > 0
          ? ((goal.baselineValue - currentEmissions) / goal.baselineValue) * 100
          : 0;

      const currentValue = parseFloat(Math.max(0, reductionAchieved).toFixed(2));

      // Check if goal is completed or failed
      const now = new Date();
      let status: 'active' | 'completed' | 'failed' = 'active';
      if (currentValue >= goal.targetReduction) {
        status = 'completed';
      } else if (now > goal.endDate) {
        status = 'failed';
      }

      await goalRepository.updateById(goal._id.toString(), {
        currentValue,
        status,
      });
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────

  private computeEndDate(start: Date, period: string): Date {
    const end = new Date(start);
    switch (period) {
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
    }
    return end;
  }

  private periodToDays(period: string): number {
    switch (period) {
      case 'weekly':
        return 7;
      case 'monthly':
        return 30;
      case 'yearly':
        return 365;
      default:
        return 30;
    }
  }
}

export const goalService = new GoalService();
