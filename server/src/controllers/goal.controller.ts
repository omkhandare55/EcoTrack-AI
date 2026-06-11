import { Request, Response } from 'express';
import { goalService } from '../services/GoalService';
import { catchAsync } from '../middleware/errorHandler';

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

export const deleteGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { id } = req.params;
  await goalService.deleteGoal(userId, id as string);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
