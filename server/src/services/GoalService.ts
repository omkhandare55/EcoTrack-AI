import { AppError } from '../middleware/errorHandler';
import { goalRepository } from '../repositories/GoalRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import type { IGoal } from '../types';
import type { CreateGoalInput, UpdateGoalInput } from '../validators/goal.validator';

export class GoalService {
  /**
   * Create a new goal, computing baseline from recent historical data.
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
   * All goals for a user.
   */
  async getGoals(userId: string): Promise<IGoal[]> {
    return goalRepository.findByUserId(userId);
  }

  /**
   * Update a goal – verifies ownership.
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
   * Delete a goal – verifies ownership.
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
   * Recalculate progress for all active goals.
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
