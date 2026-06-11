import { Request, Response } from 'express';
import { activityService } from '../services/ActivityService';
import { catchAsync } from '../middleware/errorHandler';
import type { QueryActivitiesInput } from '../validators/activity.validator';

/**
 * Controller endpoint to log a new environmental activity.
 * Calculates carbon emissions based on input factors and persists the log in the database.
 *
 * @route POST /api/v1/activities
 * @access Private
 * @param req - Express request object containing the logged activity payload.
 * @param res - Express response object.
 * @returns A promise resolving to the created activity details.
 */
export const create = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const activity = await activityService.logActivity(userId, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      activity,
    },
  });
});

/**
 * Controller endpoint to retrieve a paginated list of activities logged by the user.
 * Supports filtering by category and date ranges.
 *
 * @route GET /api/v1/activities
 * @access Private
 * @param req - Express request object with query parameters.
 * @param res - Express response object.
 * @returns A promise resolving to the paginated list of activity records.
 */
export const getAll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const result = await activityService.getActivities(
    userId,
    req.query as unknown as QueryActivitiesInput,
  );

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

/**
 * Controller endpoint to retrieve a single logged activity by its database ID.
 * Verifies that the requesting user is the owner of the activity.
 *
 * @route GET /api/v1/activities/:id
 * @access Private
 * @param req - Express request object containing the activity ID in path params.
 * @param res - Express response object.
 * @returns A promise resolving to the requested activity details.
 * @throws {AppError} 404 if activity not found, or 403 if user is unauthorized.
 */
export const getById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { id } = req.params;
  const activity = await activityService.getActivityById(userId, id as string);

  res.status(200).json({
    status: 'success',
    data: {
      activity,
    },
  });
});

/**
 * Controller endpoint to delete a logged activity by its database ID.
 * Verifies that the requesting user is the owner of the activity.
 *
 * @route DELETE /api/v1/activities/:id
 * @access Private
 * @param req - Express request object containing the activity ID in path params.
 * @param res - Express response object.
 * @returns A promise resolving when the activity is deleted (status 204).
 * @throws {AppError} 404 if activity not found, or 403 if user is unauthorized.
 */
export const deleteActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { id } = req.params;
  await activityService.deleteActivity(userId, id as string);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
