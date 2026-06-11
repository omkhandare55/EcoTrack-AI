import { Request, Response } from 'express';
import { recommendationService } from '../services/RecommendationService';
import { catchAsync } from '../middleware/errorHandler';

/**
 * Controller endpoint to retrieve personalized recommendations based on the user's carbon footprint habits.
 * 
 * @route GET /api/v1/recommendations
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to the list of personalized recommendations.
 */
export const getRecommendations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const recommendations = await recommendationService.getRecommendations(userId);

  res.status(200).json({
    status: 'success',
    data: {
      recommendations,
    },
  });
});
