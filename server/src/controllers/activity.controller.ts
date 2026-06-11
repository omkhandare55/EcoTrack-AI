import { Request, Response } from 'express';
import { activityService } from '../services/ActivityService';
import { catchAsync } from '../middleware/errorHandler';

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

export const getAll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const result = await activityService.getActivities(userId, req.query as any);

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

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

export const deleteActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { id } = req.params;
  await activityService.deleteActivity(userId, id as string);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
