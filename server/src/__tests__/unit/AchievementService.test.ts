import { AchievementService } from '../../services/AchievementService';
import Achievement from '../../models/Achievement';
import Activity from '../../models/Activity';
import Goal from '../../models/Goal';
import { ChallengeProgress } from '../../models/Challenge';

jest.mock('../../models/Achievement', () => {
  const mockAchievement = {
    find: jest.fn(),
    create: jest.fn(),
  };
  return mockAchievement;
});

jest.mock('../../models/Activity', () => {
  const mockActivity = {
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    aggregate: jest.fn(),
    base: {
      Types: {
        ObjectId: {
          createFromHexString: jest.fn((id) => id),
        },
      },
    },
  };
  return mockActivity;
});

jest.mock('../../models/Goal', () => {
  const mockGoal = {
    countDocuments: jest.fn(),
  };
  return mockGoal;
});

jest.mock('../../models/Challenge', () => {
  const mockChallengeProgress = {
    countDocuments: jest.fn(),
  };
  return {
    ChallengeProgress: mockChallengeProgress,
  };
});

describe('AchievementService Unit Tests', () => {
  let achievementService: AchievementService;

  beforeEach(() => {
    achievementService = new AchievementService();
    jest.clearAllMocks();
  });

  describe('getUserAchievements', () => {
    it('should query and return achievements sorted descending', async () => {
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ badge: 'first_activity' }]),
      };
      (Achievement.find as jest.Mock).mockReturnValue(mockChain);

      const result = await achievementService.getUserAchievements('user-123');
      expect(Achievement.find).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(mockChain.sort).toHaveBeenCalledWith({ earnedAt: -1 });
      expect(result).toEqual([{ badge: 'first_activity' }]);
    });
  });

  describe('checkAndAward', () => {
    let mockFindChain: any;
    let mockFindActivitiesChain: any;
    let mockFindOneActivityChain: any;

    beforeEach(() => {
      mockFindChain = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]), // no existing achievements
      };
      (Achievement.find as jest.Mock).mockReturnValue(mockFindChain);

      mockFindActivitiesChain = {
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]), // no activities for streak
      };
      (Activity.find as jest.Mock).mockReturnValue(mockFindActivitiesChain);

      mockFindOneActivityChain = {
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null), // no first activity
      };
      (Activity.findOne as jest.Mock).mockReturnValue(mockFindOneActivityChain);

      (Activity.countDocuments as jest.Mock).mockResolvedValue(0);
      (Goal.countDocuments as jest.Mock).mockResolvedValue(0);
      (ChallengeProgress.countDocuments as jest.Mock).mockResolvedValue(0);
    });

    it('should not award anything if counters are 0', async () => {
      const result = await achievementService.checkAndAward('user-123');
      expect(result).toEqual([]);
      expect(Achievement.create).not.toHaveBeenCalled();
    });

    it('should award first_activity if user has 1 activity logged', async () => {
      (Activity.countDocuments as jest.Mock).mockResolvedValue(1);
      const mockCreated = {
        toObject: () => ({ badge: 'first_activity', title: 'First Steps' }),
      };
      (Achievement.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await achievementService.checkAndAward('user-123');
      expect(result.length).toBe(1);
      expect(result[0].badge).toBe('first_activity');
      expect(Achievement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          badge: 'first_activity',
        }),
      );
    });

    it('should award ten_activities and first_activity if count is 10', async () => {
      (Activity.countDocuments as jest.Mock).mockResolvedValue(10);
      const mockCreated1 = { toObject: () => ({ badge: 'first_activity' }) };
      const mockCreated2 = { toObject: () => ({ badge: 'ten_activities' }) };
      (Achievement.create as jest.Mock)
        .mockResolvedValueOnce(mockCreated1)
        .mockResolvedValueOnce(mockCreated2);

      const result = await achievementService.checkAndAward('user-123');
      expect(result.length).toBe(2);
    });

    it('should award streak badges if streak count criteria met', async () => {
      // Mock unique activities logged on consecutive days
      const d1 = new Date();
      const d2 = new Date();
      d2.setDate(d2.getDate() - 1);
      const d3 = new Date();
      d3.setDate(d3.getDate() - 2);
      const d4 = new Date();
      d4.setDate(d4.getDate() - 3);
      const d5 = new Date();
      d5.setDate(d5.getDate() - 4);
      const d6 = new Date();
      d6.setDate(d6.getDate() - 5);
      const d7 = new Date();
      d7.setDate(d7.getDate() - 6);

      mockFindActivitiesChain.exec.mockResolvedValue([
        { date: d1 },
        { date: d2 },
        { date: d3 },
        { date: d4 },
        { date: d5 },
        { date: d6 },
        { date: d7 },
      ]);

      const mockCreated = { toObject: () => ({ badge: 'seven_day_streak' }) };
      (Achievement.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await achievementService.checkAndAward('user-123');
      const badgesEarned = result.map((r) => r.badge);
      expect(badgesEarned).toContain('seven_day_streak');
    });

    it('should award reduced_10_percent if monthly reduction is calculated', async () => {
      // Mock first activity month
      const firstDate = new Date();
      firstDate.setMonth(firstDate.getMonth() - 2);
      mockFindOneActivityChain.exec.mockResolvedValue({ date: firstDate });

      // Mock aggregate outputs for past and current months
      // first month aggregate = 100 kg, this month aggregate = 80 kg -> 20% reduction
      (Activity.aggregate as jest.Mock)
        .mockResolvedValueOnce([{ total: 100 }]) // first month
        .mockResolvedValueOnce([{ total: 80 }]); // this month

      const mockCreated = { toObject: () => ({ badge: 'reduced_10_percent' }) };
      (Achievement.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await achievementService.checkAndAward('user-123');
      const badgesEarned = result.map((r) => r.badge);
      expect(badgesEarned).toContain('reduced_10_percent');
    });

    it('should award goal_completed badge if user has a completed goal', async () => {
      (Goal.countDocuments as jest.Mock).mockResolvedValue(1);
      const mockCreated = { toObject: () => ({ badge: 'goal_completed' }) };
      (Achievement.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await achievementService.checkAndAward('user-123');
      const badgesEarned = result.map((r) => r.badge);
      expect(badgesEarned).toContain('goal_completed');
    });

    it('should award five_challenges badge if user has completed 5 challenges', async () => {
      (ChallengeProgress.countDocuments as jest.Mock).mockResolvedValue(5);
      const mockCreated = { toObject: () => ({ badge: 'five_challenges' }) };
      (Achievement.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await achievementService.checkAndAward('user-123');
      const badgesEarned = result.map((r) => r.badge);
      expect(badgesEarned).toContain('five_challenges');
    });
  });
});
