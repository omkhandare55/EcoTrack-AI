import { AppError } from '../middleware/errorHandler';
import { challengeRepository } from '../repositories/ChallengeRepository';
import { achievementService } from './AchievementService';
import type { IChallenge, IChallengeProgress } from '../types';

export class ChallengeService {
  /**
   * List all active challenges.
   */
  async getChallenges(): Promise<IChallenge[]> {
    return challengeRepository.findActiveChallenges();
  }

  /**
   * Get a user's progress across challenges.
   */
  async getUserProgress(userId: string): Promise<IChallengeProgress[]> {
    return challengeRepository.getUserProgress(userId);
  }

  /**
   * Complete a challenge for a user, update streak, and check achievements.
   */
  async completeChallenge(userId: string, challengeId: string): Promise<IChallengeProgress> {
    // Verify challenge exists and is active
    const challenge = await challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new AppError('Challenge not found.', 404);
    }
    if (!challenge.isActive) {
      throw new AppError('This challenge is no longer active.', 400);
    }

    const progress = await challengeRepository.completeChallenge(userId, challengeId);

    // Fire-and-forget achievement check
    achievementService.checkAndAward(userId).catch(() => {
      /* best-effort */
    });

    return progress;
  }

  /**
   * Leaderboard.
   */
  async getLeaderboard(limit: number = 10) {
    return challengeRepository.getLeaderboard(limit);
  }
}

export const challengeService = new ChallengeService();
