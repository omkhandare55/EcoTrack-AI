import { AppError } from '../middleware/errorHandler';
import { activityRepository } from '../repositories/ActivityRepository';
import { calculateEmission } from '../utils/carbonCalculator';
import { achievementService } from './AchievementService';
import type { IActivity, IPaginatedResponse } from '../types';
import type { CreateActivityInput, QueryActivitiesInput } from '../validators/activity.validator';

export class ActivityService {
  /**
   * Log a new activity in the database, calculate its carbon emission values, and trigger achievement updates.
   * @param userId - The ID of the user logging the activity.
   * @param data - The activity input payload (category, value, unit, etc.).
   * @returns A promise resolving to the created activity document.
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
   * Fetch a paginated and filtered list of activities logged by a specific user.
   * @param userId - The ID of the user requesting the list.
   * @param query - The pagination, filter, and sorting query parameters.
   * @returns A promise resolving to a paginated response containing matching activity documents.
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
   * Retrieve a single activity by its ID, checking that the user owns the activity document.
   * @param userId - The ID of the authenticated user requesting the activity.
   * @param activityId - The ID of the activity document to retrieve.
   * @returns A promise resolving to the matching activity document.
   * @throws {AppError} 404 if not found, or 403 if user is not the owner.
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
   * Delete an activity by its ID, validating that the requesting user owns the activity document.
   * @param userId - The ID of the user deleting the activity.
   * @param activityId - The ID of the activity document to delete.
   * @returns A promise resolving when deletion is complete.
   * @throws {AppError} 404 if not found, or 403 if user is not the owner.
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
