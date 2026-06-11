import { AppError } from '../middleware/errorHandler';
import { challengeRepository } from '../repositories/ChallengeRepository';
import { achievementService } from './AchievementService';
import type { IChallenge, IChallengeProgress } from '../types';

export class ChallengeService {
  /**
   * Retrieves all active challenges from the database, sorted by points descending.
   * 
   * @returns A promise resolving to an array of active challenge documents.
   */
  async getChallenges(): Promise<IChallenge[]> {
    return challengeRepository.findActiveChallenges();
  }

  /**
   * Retrieves the current challenge progress list for a specific user.
   * Includes populated details about the associated challenges.
   * 
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to an array of challenge progress documents.
   */
  async getUserProgress(userId: string): Promise<IChallengeProgress[]> {
    return challengeRepository.getUserProgress(userId);
  }

  /**
   * Completes a specific challenge for a user, incrementing completion dates and streaks.
   * Awards points if appropriate and asynchronously checks for milestone achievements.
   * 
   * @param userId - The unique ID of the completing user.
   * @param challengeId - The unique ID of the completed challenge.
   * @returns A promise resolving to the updated challenge progress document.
   * @throws {AppError} 404 if challenge does not exist, or 400 if the challenge is inactive.
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
   * Retrieves the leader board rankings based on challenge activity completions.
   * 
   * @param limit - The maximum number of entries to return. Defaults to 10.
   * @returns A promise resolving to the leaderboard rankings with totals and max streaks.
   */
  async getLeaderboard(limit: number = 10) {
    return challengeRepository.getLeaderboard(limit);
  }
}

export const challengeService = new ChallengeService();
