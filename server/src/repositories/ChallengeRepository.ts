import { PipelineStage } from 'mongoose';
import { Challenge, ChallengeProgress } from '../models/Challenge';
import type { IChallenge, IChallengeProgress } from '../types';
import { BaseRepository } from './BaseRepository';

export class ChallengeRepository extends BaseRepository<IChallenge> {
  constructor() {
    super(Challenge);
  }

  /**
   * Retrieves all challenges that are currently marked as active, sorted by points descending.
   *
   * @returns A promise resolving to an array of active challenge documents.
   */
  async findActiveChallenges(): Promise<IChallenge[]> {
    return Challenge.find({ isActive: true }).sort({ points: -1 }).lean<IChallenge[]>().exec();
  }

  /**
   * Retrieves the challenge progress records for a user, populating detailed challenge metadata.
   * sorted by last update date descending.
   *
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to an array of challenge progress documents.
   */
  async getUserProgress(userId: string): Promise<IChallengeProgress[]> {
    return ChallengeProgress.find({ userId })
      .populate('challengeId')
      .sort({ updatedAt: -1 })
      .lean<IChallengeProgress[]>()
      .exec();
  }

  /**
   * Marks a challenge as completed for today. Automatically computes logging streaks,
   * tracks dates of completion, handles one-time challenges, and creates a progress record if none exists.
   *
   * @param userId - The unique ID of the completing user.
   * @param challengeId - The unique ID of the challenge.
   * @returns A promise resolving to the updated challenge progress document.
   */
  async completeChallenge(userId: string, challengeId: string): Promise<IChallengeProgress> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let progress = await ChallengeProgress.findOne({ userId, challengeId });

    if (!progress) {
      const challenge = await Challenge.findById(challengeId).lean<IChallenge>();
      const status = challenge?.frequency === 'one-time' ? 'completed' : 'in-progress';

      progress = await ChallengeProgress.create({
        userId,
        challengeId,
        status,
        streak: 1,
        completedDates: [today],
        lastCompletedAt: now,
      });
      return progress.toObject() as IChallengeProgress;
    }

    // Check if already completed today
    const alreadyCompletedToday = progress.completedDates.some((d) => {
      const pDate = new Date(d);
      return (
        pDate.getFullYear() === today.getFullYear() &&
        pDate.getMonth() === today.getMonth() &&
        pDate.getDate() === today.getDate()
      );
    });

    if (!alreadyCompletedToday) {
      // Calculate streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const completedYesterday = progress.completedDates.some((d) => {
        const pDate = new Date(d);
        return (
          pDate.getFullYear() === yesterday.getFullYear() &&
          pDate.getMonth() === yesterday.getMonth() &&
          pDate.getDate() === yesterday.getDate()
        );
      });

      progress.streak = completedYesterday ? progress.streak + 1 : 1;
      progress.completedDates.push(today);
      progress.lastCompletedAt = now;
    }

    // Mark as completed if this is a one-time challenge
    const challenge = await Challenge.findById(challengeId).lean<IChallenge>();
    if (challenge?.frequency === 'one-time') {
      progress.status = 'completed';
    }

    await progress.save();
    return progress.toObject() as IChallengeProgress;
  }

  /**
   * Retrieves the application leaderboard: users ranked by their total completed challenge dates count.
   *
   * @param limit - The maximum number of rankings to return. Defaults to 10.
   * @returns A promise resolving to the leaderboard rankings array.
   */
  async getLeaderboard(
    limit: number = 10,
  ): Promise<{ userId: string; totalCompletions: number; totalStreak: number }[]> {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: '$userId',
          totalCompletions: { $sum: { $size: '$completedDates' } },
          totalStreak: { $max: '$streak' },
        },
      },
      { $sort: { totalCompletions: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          totalCompletions: 1,
          totalStreak: 1,
        },
      },
    ];

    return ChallengeProgress.aggregate(pipeline).exec();
  }
}

export const challengeRepository = new ChallengeRepository();
