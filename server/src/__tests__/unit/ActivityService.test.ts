import { AppError } from '../../middleware/errorHandler';
import type { IActivity, IPaginatedResponse } from '../../types';
import type {
  CreateActivityInput,
  QueryActivitiesInput,
} from '../../validators/activity.validator';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../repositories/ActivityRepository', () => ({
  activityRepository: {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
  },
}));

jest.mock('../../utils/carbonCalculator', () => ({
  calculateEmission: jest.fn(),
}));

jest.mock('../../../src/services/AchievementService', () => ({
  achievementService: {
    checkAndAward: jest.fn(),
  },
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import { ActivityService } from '../../services/ActivityService';
import { activityRepository } from '../../repositories/ActivityRepository';
import { calculateEmission } from '../../utils/carbonCalculator';
import { achievementService } from '../../services/AchievementService';

const mockedRepo = activityRepository as jest.Mocked<typeof activityRepository>;
const mockedCalc = calculateEmission as jest.MockedFunction<typeof calculateEmission>;
const mockedAchievements = achievementService as jest.Mocked<typeof achievementService>;

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('ActivityService', () => {
  let service: ActivityService;

  const userId = '6652a1f0b4e5c71a2d3f0001';

  beforeEach(() => {
    service = new ActivityService();
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // logActivity
  // ═══════════════════════════════════════════════════════════════════════════

  describe('logActivity', () => {
    const input: CreateActivityInput = {
      category: 'transportation',
      subcategory: 'car',
      value: 50,
      unit: 'km',
      date: '2026-06-10T10:00:00.000Z',
      metadata: { note: 'commute' },
    };

    const fakeActivity = {
      _id: 'act1',
      userId,
      category: 'transportation',
      subcategory: 'car',
      value: 50,
      unit: 'km',
      carbonKg: 10.5,
      date: new Date('2026-06-10T10:00:00.000Z'),
      metadata: { note: 'commute' },
    } as unknown as IActivity;

    it('should calculate carbon emission with the correct arguments', async () => {
      mockedCalc.mockReturnValue(10.5);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      await service.logActivity(userId, input);

      expect(mockedCalc).toHaveBeenCalledWith('transportation', 'car', 50, 'km');
    });

    it('should create an activity with the calculated carbonKg', async () => {
      mockedCalc.mockReturnValue(10.5);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      const result = await service.logActivity(userId, input);

      expect(mockedRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          category: 'transportation',
          subcategory: 'car',
          value: 50,
          unit: 'km',
          carbonKg: 10.5,
          metadata: { note: 'commute' },
        }),
      );
      expect(result).toBe(fakeActivity);
    });

    it('should use the provided date when supplied', async () => {
      mockedCalc.mockReturnValue(5);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      await service.logActivity(userId, input);

      const createArg = mockedRepo.create.mock.calls[0][0] as Record<string, unknown>;
      expect(createArg.date).toEqual(new Date('2026-06-10T10:00:00.000Z'));
    });

    it('should default date to now when not provided', async () => {
      const inputNoDate: CreateActivityInput = {
        category: 'food',
        subcategory: 'beef',
        value: 1,
        unit: 'kg',
      };

      mockedCalc.mockReturnValue(27);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      const before = Date.now();
      await service.logActivity(userId, inputNoDate);
      const after = Date.now();

      const createArg = mockedRepo.create.mock.calls[0][0] as Record<string, unknown>;
      const dateMs = (createArg.date as Date).getTime();
      expect(dateMs).toBeGreaterThanOrEqual(before);
      expect(dateMs).toBeLessThanOrEqual(after);
    });

    it('should default metadata to empty object when not provided', async () => {
      const inputNoMeta: CreateActivityInput = {
        category: 'electricity',
        subcategory: 'grid',
        value: 100,
        unit: 'kWh',
      };

      mockedCalc.mockReturnValue(47.5);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      await service.logActivity(userId, inputNoMeta);

      const createArg = mockedRepo.create.mock.calls[0][0] as Record<string, unknown>;
      expect(createArg.metadata).toEqual({});
    });

    it('should trigger achievement check (fire-and-forget)', async () => {
      mockedCalc.mockReturnValue(10.5);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      await service.logActivity(userId, input);

      expect(mockedAchievements.checkAndAward).toHaveBeenCalledWith(userId);
    });

    it('should swallow achievement check errors without throwing', async () => {
      mockedCalc.mockReturnValue(10.5);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockRejectedValue(new Error('Achievement DB down'));

      // Should NOT throw
      const result = await service.logActivity(userId, input);
      expect(result).toBe(fakeActivity);
    });

    it('should return the created activity', async () => {
      mockedCalc.mockReturnValue(10.5);
      mockedRepo.create.mockResolvedValue(fakeActivity);
      mockedAchievements.checkAndAward.mockResolvedValue([]);

      const result = await service.logActivity(userId, input);

      expect(result).toBe(fakeActivity);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getActivities
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getActivities', () => {
    const query: QueryActivitiesInput = {
      page: 2,
      limit: 10,
      sort: '-carbonKg',
      category: 'food',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-06-01T00:00:00.000Z',
    };

    const paginatedResult: IPaginatedResponse<IActivity> = {
      data: [],
      total: 0,
      page: 2,
      limit: 10,
      totalPages: 0,
    };

    it('should delegate to repository with correct filters', async () => {
      mockedRepo.findByUserId.mockResolvedValue(paginatedResult);

      const result = await service.getActivities(userId, query);

      expect(mockedRepo.findByUserId).toHaveBeenCalledWith(userId, {
        page: 2,
        limit: 10,
        sort: '-carbonKg',
        category: 'food',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-06-01T00:00:00.000Z',
      });
      expect(result).toBe(paginatedResult);
    });

    it('should pass undefined optional fields when not provided', async () => {
      const minimalQuery: QueryActivitiesInput = {
        page: 1,
        limit: 20,
        sort: '-date',
      };
      mockedRepo.findByUserId.mockResolvedValue(paginatedResult);

      await service.getActivities(userId, minimalQuery);

      expect(mockedRepo.findByUserId).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 20,
        sort: '-date',
        category: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getActivityById
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getActivityById', () => {
    const activityId = 'act-123';

    it('should return the activity when found and owned by user', async () => {
      const ownedActivity = {
        _id: activityId,
        userId: { toString: () => userId },
        category: 'food',
      } as unknown as IActivity;

      mockedRepo.findById.mockResolvedValue(ownedActivity);

      const result = await service.getActivityById(userId, activityId);

      expect(mockedRepo.findById).toHaveBeenCalledWith(activityId);
      expect(result).toBe(ownedActivity);
    });

    it('should throw 404 AppError when activity is not found', async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(service.getActivityById(userId, activityId)).rejects.toThrow(AppError);
      await expect(service.getActivityById(userId, activityId)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Activity not found.',
      });
    });

    it('should throw 403 AppError when activity belongs to another user', async () => {
      const otherActivity = {
        _id: activityId,
        userId: { toString: () => 'other-user-id' },
        category: 'food',
      } as unknown as IActivity;

      mockedRepo.findById.mockResolvedValue(otherActivity);

      await expect(service.getActivityById(userId, activityId)).rejects.toThrow(AppError);
      await expect(service.getActivityById(userId, activityId)).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to view this activity.',
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // deleteActivity
  // ═══════════════════════════════════════════════════════════════════════════

  describe('deleteActivity', () => {
    const activityId = 'act-456';

    it('should delete the activity when found and owned by user', async () => {
      const ownedActivity = {
        _id: activityId,
        userId: { toString: () => userId },
      } as unknown as IActivity;

      mockedRepo.findById.mockResolvedValue(ownedActivity);
      mockedRepo.deleteById.mockResolvedValue(undefined as any);

      await service.deleteActivity(userId, activityId);

      expect(mockedRepo.findById).toHaveBeenCalledWith(activityId);
      expect(mockedRepo.deleteById).toHaveBeenCalledWith(activityId);
    });

    it('should throw 404 AppError when activity is not found', async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(service.deleteActivity(userId, activityId)).rejects.toThrow(AppError);
      await expect(service.deleteActivity(userId, activityId)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Activity not found.',
      });
    });

    it('should throw 403 AppError when activity belongs to another user', async () => {
      const otherActivity = {
        _id: activityId,
        userId: { toString: () => 'someone-else' },
      } as unknown as IActivity;

      mockedRepo.findById.mockResolvedValue(otherActivity);

      await expect(service.deleteActivity(userId, activityId)).rejects.toThrow(AppError);
      await expect(service.deleteActivity(userId, activityId)).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to delete this activity.',
      });
    });

    it('should not call deleteById when activity is not found', async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(service.deleteActivity(userId, activityId)).rejects.toThrow();
      expect(mockedRepo.deleteById).not.toHaveBeenCalled();
    });

    it('should not call deleteById when user does not own the activity', async () => {
      const otherActivity = {
        _id: activityId,
        userId: { toString: () => 'someone-else' },
      } as unknown as IActivity;

      mockedRepo.findById.mockResolvedValue(otherActivity);

      await expect(service.deleteActivity(userId, activityId)).rejects.toThrow();
      expect(mockedRepo.deleteById).not.toHaveBeenCalled();
    });
  });
});
