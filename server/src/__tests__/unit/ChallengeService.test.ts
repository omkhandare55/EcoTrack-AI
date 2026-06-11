import { AppError } from '../../middleware/errorHandler';
import type { IChallenge, IChallengeProgress } from '../../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../repositories/ChallengeRepository', () => ({
  challengeRepository: {
    findActiveChallenges: jest.fn(),
    getUserProgress: jest.fn(),
    findById: jest.fn(),
    completeChallenge: jest.fn(),
    getLeaderboard: jest.fn(),
  },
}));

jest.mock('../../services/AchievementService', () => ({
  achievementService: {
    checkAndAward: jest.fn(),
  },
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import { ChallengeService } from '../../services/ChallengeService';
import { challengeRepository } from '../../repositories/ChallengeRepository';
import { achievementService } from '../../services/AchievementService';

const mockedRepo = challengeRepository as jest.Mocked<typeof challengeRepository>;
const mockedAchievements = achievementService as jest.Mocked<typeof achievementService>;

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('ChallengeService', () => {
  let service: ChallengeService;

  const userId = '6652a1f0b4e5c71a2d3f0001';
  const challengeId = 'chal-001';

  beforeEach(() => {
    service = new ChallengeService();
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getChallenges
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getChallenges', () => {
    it('should return a list of active challenges from the repository', async () => {
      const challenges = [
        { _id: 'c1', title: 'Bike to Work', isActive: true, points: 50 },
        { _id: 'c2', title: 'Meatless Monday', isActive: true, points: 30 },
      ] as unknown as IChallenge[];

      mockedRepo.findActiveChallenges.mockResolvedValue(challenges);

      const result = await service.getChallenges();

      expect(mockedRepo.findActiveChallenges).toHaveBeenCalledTimes(1);
      expect(result).toBe(challenges);
    });

    it('should return an empty array when no active challenges exist', async () => {
      mockedRepo.findActiveChallenges.mockResolvedValue([]);

      const result = await service.getChallenges();

      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getUserProgress
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getUserProgress', () => {
    it('should return user progress list from the repository', async () => {
      const progressList = [
        { _id: 'p1', userId, challengeId: 'c1', status: 'in-progress', streak: 3 },
        { _id: 'p2', userId, challengeId: 'c2', status: 'completed', streak: 7 },
      ] as unknown as IChallengeProgress[];

      mockedRepo.getUserProgress.mockResolvedValue(progressList);

      const result = await service.getUserProgress(userId);

      expect(mockedRepo.getUserProgress).toHaveBeenCalledWith(userId);
      expect(result).toBe(progressList);
    });

    it('should return an empty array when user has no progress', async () => {
      mockedRepo.getUserProgress.mockResolvedValue([]);

      const result = await service.getUserProgress(userId);

      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // completeChallenge
  // ═══════════════════════════════════════════════════════════════════════════

  describe('completeChallenge', () => {
    const activeChallenge = {
      _id: challengeId,
      title: 'Bike to Work',
      isActive: true,
      points: 50,
    } as unknown as IChallenge;

    const progressResult = {
      _id: 'prog-1',
      userId,
      challengeId,
      status: 'in-progress',
      streak: 1,
      completedDates: [new Date()],
      lastCompletedAt: new Date(),
    } as unknown as IChallengeProgress;

    it('should complete the challenge successfully when it exists and is active', async () => {
      mockedRepo.findById.mockResolvedValue(activeChallenge);
      mockedRepo.completeChallenge.mockResolvedValue(progressResult);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      const result = await service.completeChallenge(userId, challengeId);

      expect(mockedRepo.findById).toHaveBeenCalledWith(challengeId);
      expect(mockedRepo.completeChallenge).toHaveBeenCalledWith(userId, challengeId);
      expect(result).toBe(progressResult);
    });

    it('should trigger achievement check after completing a challenge', async () => {
      mockedRepo.findById.mockResolvedValue(activeChallenge);
      mockedRepo.completeChallenge.mockResolvedValue(progressResult);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      await service.completeChallenge(userId, challengeId);

      expect(mockedAchievements.checkAndAward).toHaveBeenCalledWith(userId);
    });

    it('should swallow achievement check errors without throwing', async () => {
      mockedRepo.findById.mockResolvedValue(activeChallenge);
      mockedRepo.completeChallenge.mockResolvedValue(progressResult);
      mockedAchievements.checkAndAward.mockRejectedValue(new Error('Achievement DB failure'));

      // Should NOT throw
      const result = await service.completeChallenge(userId, challengeId);
      expect(result).toBe(progressResult);
    });

    it('should throw 404 AppError when challenge is not found', async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(service.completeChallenge(userId, challengeId)).rejects.toThrow(AppError);
      await expect(service.completeChallenge(userId, challengeId)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Challenge not found.',
      });
    });

    it('should not call completeChallenge on repository when challenge is not found', async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(service.completeChallenge(userId, challengeId)).rejects.toThrow();
      expect(mockedRepo.completeChallenge).not.toHaveBeenCalled();
    });

    it('should throw 400 AppError when challenge is inactive', async () => {
      const inactiveChallenge = {
        _id: challengeId,
        title: 'Old Challenge',
        isActive: false,
        points: 10,
      } as unknown as IChallenge;

      mockedRepo.findById.mockResolvedValue(inactiveChallenge);

      await expect(service.completeChallenge(userId, challengeId)).rejects.toThrow(AppError);
      await expect(service.completeChallenge(userId, challengeId)).rejects.toMatchObject({
        statusCode: 400,
        message: 'This challenge is no longer active.',
      });
    });

    it('should not call completeChallenge on repository when challenge is inactive', async () => {
      const inactiveChallenge = {
        _id: challengeId,
        title: 'Old Challenge',
        isActive: false,
      } as unknown as IChallenge;

      mockedRepo.findById.mockResolvedValue(inactiveChallenge);

      await expect(service.completeChallenge(userId, challengeId)).rejects.toThrow();
      expect(mockedRepo.completeChallenge).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getLeaderboard
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getLeaderboard', () => {
    const leaderboardData = [
      { userId: 'user1', totalCompletions: 25, totalStreak: 10 },
      { userId: 'user2', totalCompletions: 18, totalStreak: 7 },
      { userId: 'user3', totalCompletions: 12, totalStreak: 5 },
    ];

    it('should use default limit of 10 when not provided', async () => {
      mockedRepo.getLeaderboard.mockResolvedValue(leaderboardData);

      const result = await service.getLeaderboard();

      expect(mockedRepo.getLeaderboard).toHaveBeenCalledWith(10);
      expect(result).toBe(leaderboardData);
    });

    it('should pass custom limit to repository', async () => {
      mockedRepo.getLeaderboard.mockResolvedValue(leaderboardData.slice(0, 2));

      const result = await service.getLeaderboard(5);

      expect(mockedRepo.getLeaderboard).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no leaderboard data exists', async () => {
      mockedRepo.getLeaderboard.mockResolvedValue([]);

      const result = await service.getLeaderboard(10);

      expect(result).toEqual([]);
    });

    it('should pass limit of 1 correctly', async () => {
      const single = [leaderboardData[0]];
      mockedRepo.getLeaderboard.mockResolvedValue(single);

      const result = await service.getLeaderboard(1);

      expect(mockedRepo.getLeaderboard).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(1);
    });
  });
});
