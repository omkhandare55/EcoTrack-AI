import { Request, Response } from 'express';
import { goalService } from '../services/GoalService';
import { catchAsync } from '../middleware/errorHandler';

/**
 * Controller endpoint to create a new emission reduction goal.
 *
 * @route POST /api/v1/goals
 * @access Private
 * @param req - Express request object containing the goal payload.
 * @param res - Express response object.
 * @returns A promise resolving to the created goal details.
 */
export const create = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const goal = await goalService.createGoal(userId, req.body);

  res.status(201).json({
    status: 'success',
    data: {
      goal,
    },
  });
});

/**
 * Controller endpoint to retrieve all goals for the user.
 * Automatically triggers goal progress recalculation before returning.
 *
 * @route GET /api/v1/goals
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to the user's goals.
 */
export const getAll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();

  // Recalculate progress for all active goals before listing
  await goalService.updateGoalProgress(userId);

  const goals = await goalService.getGoals(userId);

  res.status(200).json({
    status: 'success',
    data: {
      goals,
    },
  });
});

/**
 * Controller endpoint to update an existing goal's parameters.
 * Verifies that the user owns the goal before modifying.
 *
 * @route PATCH /api/v1/goals/:id
 * @access Private
 * @param req - Express request containing the update fields in body and goal ID in path parameters.
 * @param res - Express response object.
 * @returns A promise resolving to the updated goal details.
 * @throws {AppError} 404 if goal is not found, or 403 if unauthorized.
 */
export const update = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { id } = req.params;
  const goal = await goalService.updateGoal(userId, id as string, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      goal,
    },
  });
});

/**
 * Controller endpoint to delete a goal by its database ID.
 * Verifies that the user owns the goal before deletion.
 *
 * @route DELETE /api/v1/goals/:id
 * @access Private
 * @param req - Express request containing the goal ID in path parameters.
 * @param res - Express response object.
 * @returns A promise resolving when the goal is deleted (status 204).
 * @throws {AppError} 404 if goal is not found, or 403 if unauthorized.
 */
export const deleteGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { id } = req.params;
  await goalService.deleteGoal(userId, id as string);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
