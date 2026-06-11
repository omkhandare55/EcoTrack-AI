import { Request, Response } from 'express';
import { achievementService } from '../services/AchievementService';
import { catchAsync } from '../middleware/errorHandler';

/**
 * Controller endpoint to retrieve all achievements earned by the authenticated user.
 * Automatically runs a check to evaluate and award any new milestone achievements before returning the list.
 * 
 * @route GET /api/v1/achievements
 * @access Private
 * @param req - Express request object containing the authenticated user profile.
 * @param res - Express response object.
 * @returns A promise resolving to the list of user achievements.
 */
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
