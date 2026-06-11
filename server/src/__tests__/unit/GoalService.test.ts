import { GoalService } from '../../services/GoalService';
import { goalRepository } from '../../repositories/GoalRepository';
import { activityRepository } from '../../repositories/ActivityRepository';
import { AppError } from '../../middleware/errorHandler';

jest.mock('../../repositories/GoalRepository', () => ({
  goalRepository: {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    findActiveGoals: jest.fn(),
  },
}));

jest.mock('../../repositories/ActivityRepository', () => ({
  activityRepository: {
    getTotalEmissions: jest.fn(),
  },
}));

describe('GoalService Unit Tests', () => {
  let goalService: GoalService;

  beforeEach(() => {
    goalService = new GoalService();
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    it('should calculate baseline value and create a goal', async () => {
      const mockGoalInput = {
        title: 'Reduce food emissions',
        category: 'food',
        targetReduction: 10,
        period: 'weekly',
        startDate: '2026-06-11T00:00:00.000Z',
      };

      (activityRepository.getTotalEmissions as jest.Mock).mockResolvedValue(50);
      const mockGoal = { _id: 'goal-123', ...mockGoalInput, baselineValue: 50, status: 'active' };
      (goalRepository.create as jest.Mock).mockResolvedValue(mockGoal);

      const result = await goalService.createGoal('user-123', mockGoalInput as any);

      expect(activityRepository.getTotalEmissions).toHaveBeenCalled();
      expect(goalRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          title: 'Reduce food emissions',
          category: 'food',
          targetReduction: 10,
          baselineValue: 50,
          status: 'active',
        }),
      );
      expect(result).toEqual(mockGoal);
    });
  });

  describe('getGoals', () => {
    it('should retrieve goals for a user', async () => {
      const mockGoals = [{ _id: 'g1' }, { _id: 'g2' }];
      (goalRepository.findByUserId as jest.Mock).mockResolvedValue(mockGoals);

      const result = await goalService.getGoals('user-123');
      expect(goalRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockGoals);
    });
  });

  describe('updateGoal', () => {
    it('should throw 404 if goal is not found', async () => {
      (goalRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        goalService.updateGoal('user-123', 'goal-999', { title: 'New Title' }),
      ).rejects.toThrow(new AppError('Goal not found.', 404));
    });

    it('should throw 403 if user does not own the goal', async () => {
      (goalRepository.findById as jest.Mock).mockResolvedValue({
        _id: 'goal-123',
        userId: 'other-user',
      });

      await expect(
        goalService.updateGoal('user-123', 'goal-123', { title: 'New Title' }),
      ).rejects.toThrow(new AppError('You do not have permission to update this goal.', 403));
    });

    it('should update successfully if owner', async () => {
      const mockGoal = { _id: 'goal-123', userId: 'user-123', title: 'Old Title' };
      (goalRepository.findById as jest.Mock).mockResolvedValue(mockGoal);
      (goalRepository.updateById as jest.Mock).mockResolvedValue({
        ...mockGoal,
        title: 'New Title',
      });

      const result = await goalService.updateGoal('user-123', 'goal-123', { title: 'New Title' });
      expect(goalRepository.updateById).toHaveBeenCalledWith('goal-123', { title: 'New Title' });
      expect(result.title).toBe('New Title');
    });

    it('should throw 500 if updateById returns null', async () => {
      const mockGoal = { _id: 'goal-123', userId: 'user-123' };
      (goalRepository.findById as jest.Mock).mockResolvedValue(mockGoal);
      (goalRepository.updateById as jest.Mock).mockResolvedValue(null);

      await expect(
        goalService.updateGoal('user-123', 'goal-123', { title: 'New Title' }),
      ).rejects.toThrow(new AppError('Failed to update goal.', 500));
    });
  });

  describe('deleteGoal', () => {
    it('should throw 404 if goal not found', async () => {
      (goalRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(goalService.deleteGoal('user-123', 'goal-999')).rejects.toThrow(
        new AppError('Goal not found.', 404),
      );
    });

    it('should throw 403 if not owner', async () => {
      (goalRepository.findById as jest.Mock).mockResolvedValue({
        _id: 'goal-123',
        userId: 'other-user',
      });

      await expect(goalService.deleteGoal('user-123', 'goal-123')).rejects.toThrow(
        new AppError('You do not have permission to delete this goal.', 403),
      );
    });

    it('should delete successfully if owner', async () => {
      (goalRepository.findById as jest.Mock).mockResolvedValue({
        _id: 'goal-123',
        userId: 'user-123',
      });

      await goalService.deleteGoal('user-123', 'goal-123');
      expect(goalRepository.deleteById).toHaveBeenCalledWith('goal-123');
    });
  });

  describe('updateGoalProgress', () => {
    it('should calculate progress and complete goal if target met', async () => {
      const activeGoals = [
        {
          _id: 'goal-1',
          userId: 'user-123',
          targetReduction: 20,
          baselineValue: 100,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-06-30'),
        },
      ];
      (goalRepository.findActiveGoals as jest.Mock).mockResolvedValue(activeGoals);
      (activityRepository.getTotalEmissions as jest.Mock).mockResolvedValue(75); // 25% reduction

      await goalService.updateGoalProgress('user-123');

      expect(goalRepository.updateById).toHaveBeenCalledWith('goal-1', {
        currentValue: 25,
        status: 'completed',
      });
    });

    it('should fail goal if past end date and target not met', async () => {
      const activeGoals = [
        {
          _id: 'goal-2',
          userId: 'user-123',
          targetReduction: 20,
          baselineValue: 100,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-06-05'), // in the past
        },
      ];
      (goalRepository.findActiveGoals as jest.Mock).mockResolvedValue(activeGoals);
      (activityRepository.getTotalEmissions as jest.Mock).mockResolvedValue(95); // 5% reduction (not met)

      await goalService.updateGoalProgress('user-123');

      expect(goalRepository.updateById).toHaveBeenCalledWith('goal-2', {
        currentValue: 5,
        status: 'failed',
      });
    });
  });
});
