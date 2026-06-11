import { AppError } from '../middleware/errorHandler';
import { activityRepository } from '../repositories/ActivityRepository';
import { calculateEmission } from '../utils/carbonCalculator';
import { achievementService } from './AchievementService';
import type { IActivity, IPaginatedResponse } from '../types';
import type { CreateActivityInput, QueryActivitiesInput } from '../validators/activity.validator';

export class ActivityService {
  /**
   * Log a new activity and trigger achievement checks.
   */
  async logActivity(userId: string, data: CreateActivityInput): Promise<IActivity> {
    const carbonKg = calculateEmission(data.category, data.subcategory, data.value, data.unit);

    const activity = await activityRepository.create({
      userId: userId as unknown as IActivity['userId'],
      category: data.category,
      subcategory: data.subcategory,
      value: data.value,
      unit: data.unit,
      carbonKg,
      date: data.date ? new Date(data.date) : new Date(),
      metadata: data.metadata ?? {},
    } as Partial<IActivity>);

    // Fire-and-forget achievement check (non-blocking)
    achievementService.checkAndAward(userId).catch(() => {
      /* swallow – achievements are best-effort */
    });

    return activity;
  }

  /**
   * Paginated activities with optional filters.
   */
  async getActivities(
    userId: string,
    query: QueryActivitiesInput,
  ): Promise<IPaginatedResponse<IActivity>> {
    return activityRepository.findByUserId(userId, {
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      category: query.category,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  /**
   * Single activity by ID – verifies ownership.
   */
  async getActivityById(userId: string, activityId: string): Promise<IActivity> {
    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new AppError('Activity not found.', 404);
    }
    if (activity.userId.toString() !== userId) {
      throw new AppError('You do not have permission to view this activity.', 403);
    }
    return activity;
  }

  /**
   * Delete an activity – verifies ownership.
   */
  async deleteActivity(userId: string, activityId: string): Promise<void> {
    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new AppError('Activity not found.', 404);
    }
    if (activity.userId.toString() !== userId) {
      throw new AppError('You do not have permission to delete this activity.', 403);
    }
    await activityRepository.deleteById(activityId);
  }
}

export const activityService = new ActivityService();
