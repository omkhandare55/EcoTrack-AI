import { Request, Response } from 'express';
import { challengeService } from '../services/ChallengeService';
import { catchAsync } from '../middleware/errorHandler';

/**
 * Controller endpoint to retrieve all active challenges.
 *
 * @route GET /api/v1/challenges
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to the list of active challenges.
 */
export const getAll = catchAsync(async (_req: Request, res: Response) => {
  const challenges = await challengeService.getChallenges();

  res.status(200).json({
    status: 'success',
    data: {
      challenges,
    },
  });
});

/**
 * Controller endpoint to retrieve the current user's challenge progress list.
 *
 * @route GET /api/v1/challenges/progress
 * @access Private
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns A promise resolving to the user's challenge progress.
 */
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

/**
 * Controller endpoint to mark a challenge as completed by the user.
 *
 * @route POST /api/v1/challenges/:id/complete
 * @access Private
 * @param req - Express request object containing challenge ID in path params.
 * @param res - Express response object.
 * @returns A promise resolving to the updated challenge progress.
 */
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

/**
 * Controller endpoint to retrieve user leaderboard rankings based on completions.
 *
 * @route GET /api/v1/challenges/leaderboard
 * @access Private
 * @param req - Express request object containing optional limit in query.
 * @param res - Express response object.
 * @returns A promise resolving to the leaderboard rankings.
 */
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
