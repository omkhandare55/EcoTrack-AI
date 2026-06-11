import { Request, Response } from 'express';
import { recommendationService } from '../services/RecommendationService';
import { catchAsync } from '../middleware/errorHandler';

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
