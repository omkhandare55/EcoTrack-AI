import { Request, Response } from 'express';
import { challengeService } from '../services/ChallengeService';
import { catchAsync } from '../middleware/errorHandler';

export const getAll = catchAsync(async (_req: Request, res: Response) => {
  const challenges = await challengeService.getChallenges();

  res.status(200).json({
    status: 'success',
    data: {
      challenges,
    },
  });
});

export const getProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const progress = await challengeService.getUserProgress(userId);

  res.status(200).json({
    status: 'success',
    data: {
      progress,
    },
  });
});

export const complete = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  const { id: challengeId } = req.params;
  const progress = await challengeService.completeChallenge(userId, challengeId as string);

  res.status(200).json({
    status: 'success',
    data: {
      progress,
    },
  });
});

export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const leaderboard = await challengeService.getLeaderboard(limit);

  res.status(200).json({
    status: 'success',
    data: {
      leaderboard,
    },
  });
});
