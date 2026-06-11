import Achievement from '../models/Achievement';
import Activity from '../models/Activity';
import Goal from '../models/Goal';
import { ChallengeProgress } from '../models/Challenge';
import type { IAchievement } from '../types';
import { BADGES } from '../utils/constants';

export class AchievementService {
  /**
   * Evaluates user statistics (activity log counts, consecutive days logging streaks,
   * total percentage reductions, goal completions, and challenge completions) and awards
   * any earned milestone badges that have not yet been granted.
   *
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to an array of newly awarded achievement documents.
   */
  async checkAndAward(userId: string): Promise<IAchievement[]> {
    const awarded: IAchievement[] = [];

    const existing = await Achievement.find({ userId }).lean<IAchievement[]>().exec();
    const earnedBadges = new Set(existing.map((a) => a.badge));

    // ── Activity count milestones ────────────────────────────────────
    const activityCount = await Activity.countDocuments({ userId });

    if (activityCount >= 1 && !earnedBadges.has(BADGES.FIRST_ACTIVITY.badge)) {
      awarded.push(await this.award(userId, BADGES.FIRST_ACTIVITY));
    }
    if (activityCount >= 10 && !earnedBadges.has(BADGES.TEN_ACTIVITIES.badge)) {
      awarded.push(await this.award(userId, BADGES.TEN_ACTIVITIES));
    }
    if (activityCount >= 100 && !earnedBadges.has(BADGES.HUNDRED_ACTIVITIES.badge)) {
      awarded.push(await this.award(userId, BADGES.HUNDRED_ACTIVITIES));
    }

    // ── Streak milestones ───────────────────────────────────────────
    const streakDays = await this.calculateStreak(userId);

    if (streakDays >= 7 && !earnedBadges.has(BADGES.SEVEN_DAY_STREAK.badge)) {
      awarded.push(await this.award(userId, BADGES.SEVEN_DAY_STREAK));
    }
    if (streakDays >= 30 && !earnedBadges.has(BADGES.THIRTY_DAY_STREAK.badge)) {
      awarded.push(await this.award(userId, BADGES.THIRTY_DAY_STREAK));
    }

    // ── Reduction milestones ────────────────────────────────────────
    const reduction = await this.calculateReduction(userId);

    if (reduction >= 10 && !earnedBadges.has(BADGES.REDUCED_10_PERCENT.badge)) {
      awarded.push(await this.award(userId, BADGES.REDUCED_10_PERCENT));
    }
    if (reduction >= 25 && !earnedBadges.has(BADGES.REDUCED_25_PERCENT.badge)) {
      awarded.push(await this.award(userId, BADGES.REDUCED_25_PERCENT));
    }

    // ── Goal completion ─────────────────────────────────────────────
    const completedGoals = await Goal.countDocuments({
      userId,
      status: 'completed',
    });
    if (completedGoals >= 1 && !earnedBadges.has(BADGES.GOAL_COMPLETED.badge)) {
      awarded.push(await this.award(userId, BADGES.GOAL_COMPLETED));
    }

    // ── Challenge completion ────────────────────────────────────────
    const completedChallenges = await ChallengeProgress.countDocuments({
      userId,
      status: 'completed',
    });
    if (completedChallenges >= 5 && !earnedBadges.has(BADGES.FIVE_CHALLENGES.badge)) {
      awarded.push(await this.award(userId, BADGES.FIVE_CHALLENGES));
    }

    return awarded;
  }

  /**
   * Retrieves all achievements earned by a user, sorted by earned date descending.
   *
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to an array of the user's achievements.
   */
  async getUserAchievements(userId: string): Promise<IAchievement[]> {
    return Achievement.find({ userId }).sort({ earnedAt: -1 }).lean<IAchievement[]>().exec();
  }

  // ─── Private helpers ──────────────────────────────────────────────

  /**
   * Internally writes a new achievement document to reward the user.
   *
   * @param userId - The unique ID of the user.
   * @param badge - The metadata of the badge being awarded.
   * @returns A promise resolving to the created achievement.
   */
  private async award(
    userId: string,
    badge: { badge: string; title: string; description: string },
  ): Promise<IAchievement> {
    const achievement = await Achievement.create({
      userId,
      badge: badge.badge,
      title: badge.title,
      description: badge.description,
    });
    return achievement.toObject() as IAchievement;
  }

  /**
   * Calculate the current consecutive-day logging streak.
   */
  private async calculateStreak(userId: string): Promise<number> {
    const activities = await Activity.find({ userId })
      .sort({ date: -1 })
      .select('date')
      .lean()
      .exec();

    if (activities.length === 0) return 0;

    // Get unique dates (YYYY-MM-DD)
    const uniqueDates = [
      ...new Set(
        activities.map((a) => {
          const d = new Date(a.date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }),
      ),
    ];

    // Sort descending
    uniqueDates.sort((a, b) => {
      const da = new Date(a);
      const db = new Date(b);
      return db.getTime() - da.getTime();
    });

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffMs = prev.getTime() - curr.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate emission reduction % by comparing the first and most recent months.
   */
  private async calculateReduction(userId: string): Promise<number> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Find user's first activity date
    const firstActivity = await Activity.findOne({ userId })
      .sort({ date: 1 })
      .select('date')
      .lean()
      .exec();

    if (!firstActivity) return 0;

    const firstDate = new Date(firstActivity.date);
    const firstMonthStart = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const firstMonthEnd = new Date(
      firstDate.getFullYear(),
      firstDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Don't compare the same month
    if (firstMonthStart.getTime() === thisMonthStart.getTime()) {
      return 0;
    }

    const [firstMonthTotal, currentMonthTotal] = await Promise.all([
      this.getTotal(userId, firstMonthStart, firstMonthEnd),
      this.getTotal(userId, thisMonthStart, thisMonthEnd),
    ]);

    if (firstMonthTotal === 0) return 0;

    const reduction = ((firstMonthTotal - currentMonthTotal) / firstMonthTotal) * 100;
    return parseFloat(Math.max(0, reduction).toFixed(2));
  }

  private async getTotal(userId: string, start: Date, end: Date): Promise<number> {
    const result = await Activity.aggregate([
      {
        $match: {
          userId: Activity.base.Types.ObjectId.createFromHexString(userId),
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: '$carbonKg' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }
}

export const achievementService = new AchievementService();
