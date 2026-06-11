import { Challenge, ChallengeProgress } from '../../models/Challenge';
import { ChallengeRepository } from '../../repositories/ChallengeRepository';

// Mock models
jest.mock('../../models/Challenge', () => ({
  Challenge: {
    find: jest.fn(),
    findById: jest.fn(),
  },
  ChallengeProgress: {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  },
}));

describe('ChallengeRepository Unit Tests', () => {
  let repository: ChallengeRepository;
  const userId = 'user123';
  const challengeId = 'challenge123';

  beforeEach(() => {
    repository = new ChallengeRepository();
    jest.clearAllMocks();
  });

  describe('findActiveChallenges', () => {
    it('should find active challenges sorted by points descending', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ title: 'Active Challenge' }]),
      };
      (Challenge.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findActiveChallenges();

      expect(Challenge.find).toHaveBeenCalledWith({ isActive: true });
      expect(mockQuery.sort).toHaveBeenCalledWith({ points: -1 });
      expect(result).toEqual([{ title: 'Active Challenge' }]);
    });
  });

  describe('getUserProgress', () => {
    it('should retrieve progress details populated with challenge information', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ userId, challengeId }]),
      };
      (ChallengeProgress.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.getUserProgress(userId);

      expect(ChallengeProgress.find).toHaveBeenCalledWith({ userId });
      expect(mockQuery.populate).toHaveBeenCalledWith('challengeId');
      expect(mockQuery.sort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(result).toEqual([{ userId, challengeId }]);
    });
  });

  describe('completeChallenge', () => {
    it('should create a new progress record if none exists', async () => {
      (ChallengeProgress.findOne as jest.Mock).mockResolvedValue(null);
      (Challenge.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({ frequency: 'daily' }),
      });

      const mockProgressObj = {
        userId,
        challengeId,
        status: 'in-progress',
        streak: 1,
        toObject: jest.fn().mockReturnValue({ userId, challengeId, status: 'in-progress', streak: 1 }),
      };
      (ChallengeProgress.create as jest.Mock).mockResolvedValue(mockProgressObj);

      const result = await repository.completeChallenge(userId, challengeId);

      expect(ChallengeProgress.findOne).toHaveBeenCalledWith({ userId, challengeId });
      expect(Challenge.findById).toHaveBeenCalledWith(challengeId);
      expect(ChallengeProgress.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          challengeId,
          status: 'in-progress',
          streak: 1,
        }),
      );
      expect(result).toEqual({ userId, challengeId, status: 'in-progress', streak: 1 });
    });

    it('should complete one-time challenges immediately upon creation', async () => {
      (ChallengeProgress.findOne as jest.Mock).mockResolvedValue(null);
      (Challenge.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({ frequency: 'one-time' }),
      });

      const mockProgressObj = {
        userId,
        challengeId,
        status: 'completed',
        toObject: jest.fn().mockReturnValue({ userId, challengeId, status: 'completed' }),
      };
      (ChallengeProgress.create as jest.Mock).mockResolvedValue(mockProgressObj);

      const result = await repository.completeChallenge(userId, challengeId);
      expect(result.status).toBe('completed');
    });

    it('should increment streak when challenge was completed yesterday', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const existingProgress = {
        userId,
        challengeId,
        streak: 2,
        completedDates: [yesterday],
        lastCompletedAt: yesterday,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ userId, challengeId, streak: 3 }),
      };

      (ChallengeProgress.findOne as jest.Mock).mockResolvedValue(existingProgress);
      (Challenge.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({ frequency: 'daily' }),
      });

      const result = await repository.completeChallenge(userId, challengeId);

      expect(existingProgress.streak).toBe(3);
      expect(existingProgress.save).toHaveBeenCalled();
      expect(result.streak).toBe(3);
    });

    it('should reset streak when yesterday is missing from completed dates', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const existingProgress = {
        userId,
        challengeId,
        streak: 5,
        completedDates: [threeDaysAgo],
        lastCompletedAt: threeDaysAgo,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({ userId, challengeId, streak: 1 }),
      };

      (ChallengeProgress.findOne as jest.Mock).mockResolvedValue(existingProgress);
      (Challenge.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({ frequency: 'daily' }),
      });

      const result = await repository.completeChallenge(userId, challengeId);

      expect(existingProgress.streak).toBe(1);
      expect(result.streak).toBe(1);
    });
  });

  describe('getLeaderboard', () => {
    it('should run aggregation pipeline to build leaderboard', async () => {
      const mockQuery = {
        exec: jest.fn().mockResolvedValue([{ userId: 'user1', totalCompletions: 10 }]),
      };
      (ChallengeProgress.aggregate as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.getLeaderboard(5);

      expect(ChallengeProgress.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ $group: expect.any(Object) }),
          expect.objectContaining({ $sort: expect.any(Object) }),
          expect.objectContaining({ $limit: 5 }),
        ]),
      );
      expect(result).toEqual([{ userId: 'user1', totalCompletions: 10 }]);
    });
  });
});
