import { Request, Response } from 'express';
import { achievementService } from '../services/AchievementService';
import { catchAsync } from '../middleware/errorHandler';

export const getAchievements = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();

  // Recalculate/award achievements before listing
  await achievementService.checkAndAward(userId);

  const achievements = await achievementService.getUserAchievements(userId);

  res.status(200).json({
    status: 'success',
    data: {
      achievements,
    },
  });
});
