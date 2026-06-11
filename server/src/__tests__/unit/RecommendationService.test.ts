// Mock dependencies BEFORE importing the module under test
jest.mock('../../repositories/ActivityRepository', () => ({
  activityRepository: {
    getCategoryBreakdown: jest.fn(),
  },
}));

jest.mock('../../utils/helpers', () => ({
  getDateRange: jest.fn().mockReturnValue({
    start: new Date('2026-06-01T00:00:00.000Z'),
    end: new Date('2026-06-30T23:59:59.999Z'),
  }),
}));

import { RecommendationService } from '../../services/RecommendationService';
import { activityRepository } from '../../repositories/ActivityRepository';
import { getDateRange } from '../../utils/helpers';
import type { ICategoryBreakdown } from '../../types';

const mockGetCategoryBreakdown = activityRepository.getCategoryBreakdown as jest.Mock;
const mockGetDateRange = getDateRange as jest.Mock;

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RecommendationService();
  });

  describe('getRecommendations', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should call getDateRange with "month"', async () => {
      mockGetCategoryBreakdown.mockResolvedValue([]);

      await service.getRecommendations(userId);

      expect(mockGetDateRange).toHaveBeenCalledWith('month');
    });

    it('should call getCategoryBreakdown with userId and date range', async () => {
      mockGetCategoryBreakdown.mockResolvedValue([]);

      await service.getRecommendations(userId);

      expect(mockGetCategoryBreakdown).toHaveBeenCalledWith(
        userId,
        expect.any(Date),
        expect.any(Date),
      );
    });

    it('should return default tips from each category when user has no activities', async () => {
      mockGetCategoryBreakdown.mockResolvedValue([]);

      const result = await service.getRecommendations(userId);

      // Should get one tip from each of the 5 categories
      expect(result.length).toBe(5);

      const categories = result.map((r) => r.category);
      expect(categories).toContain('transportation');
      expect(categories).toContain('electricity');
      expect(categories).toContain('food');
      expect(categories).toContain('water');
      expect(categories).toContain('shopping');

      // All default tips should have medium priority
      result.forEach((r) => {
        expect(r.priority).toBe('medium');
      });
    });

    it('should return recommendations sorted by priority when user has activities', async () => {
      const breakdown: ICategoryBreakdown[] = [
        { category: 'transportation', totalCarbonKg: 200, percentage: 50, count: 10 },
        { category: 'food', totalCarbonKg: 100, percentage: 25, count: 8 },
        { category: 'electricity', totalCarbonKg: 50, percentage: 15, count: 5 },
        { category: 'water', totalCarbonKg: 30, percentage: 7, count: 3 },
        { category: 'shopping', totalCarbonKg: 12, percentage: 3, count: 1 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      expect(result.length).toBeGreaterThan(0);

      // Check that high-priority recommendations come first
      const priorities = result.map((r) => r.priority);
      const firstHighIdx = priorities.indexOf('high');
      const firstMediumIdx = priorities.indexOf('medium');
      const firstLowIdx = priorities.indexOf('low');

      if (firstHighIdx !== -1 && firstMediumIdx !== -1) {
        expect(firstHighIdx).toBeLessThan(firstMediumIdx);
      }
      if (firstMediumIdx !== -1 && firstLowIdx !== -1) {
        expect(firstMediumIdx).toBeLessThan(firstLowIdx);
      }
    });

    it('should assign high priority for the top category (index 0)', async () => {
      const breakdown: ICategoryBreakdown[] = [
        { category: 'transportation', totalCarbonKg: 200, percentage: 100, count: 10 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      // All transportation tips should have high priority
      const transportTips = result.filter((r) => r.category === 'transportation');
      expect(transportTips.length).toBeGreaterThan(0);
      transportTips.forEach((tip) => {
        expect(tip.priority).toBe('high');
      });
    });

    it('should assign medium priority for 2nd and 3rd categories', async () => {
      const breakdown: ICategoryBreakdown[] = [
        { category: 'transportation', totalCarbonKg: 200, percentage: 50, count: 10 },
        { category: 'food', totalCarbonKg: 100, percentage: 30, count: 8 },
        { category: 'electricity', totalCarbonKg: 50, percentage: 20, count: 5 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      const foodTips = result.filter((r) => r.category === 'food');
      foodTips.forEach((tip) => {
        expect(tip.priority).toBe('medium');
      });

      const electricityTips = result.filter((r) => r.category === 'electricity');
      electricityTips.forEach((tip) => {
        expect(tip.priority).toBe('medium');
      });
    });

    it('should assign low priority for categories after the 3rd', async () => {
      const breakdown: ICategoryBreakdown[] = [
        { category: 'transportation', totalCarbonKg: 200, percentage: 40, count: 10 },
        { category: 'food', totalCarbonKg: 100, percentage: 25, count: 8 },
        { category: 'electricity', totalCarbonKg: 50, percentage: 15, count: 5 },
        { category: 'water', totalCarbonKg: 30, percentage: 10, count: 3 },
        { category: 'shopping', totalCarbonKg: 20, percentage: 10, count: 2 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      const waterTips = result.filter((r) => r.category === 'water');
      waterTips.forEach((tip) => {
        expect(tip.priority).toBe('low');
      });

      const shoppingTips = result.filter((r) => r.category === 'shopping');
      shoppingTips.forEach((tip) => {
        expect(tip.priority).toBe('low');
      });
    });

    it('should scale estimated saving based on user emission volume', async () => {
      // With totalCarbonKg = 100, scaleFactor = 100/50 = 2
      // So scaledSaving = tip.estimatedSavingKg * 2
      const breakdown: ICategoryBreakdown[] = [
        { category: 'transportation', totalCarbonKg: 100, percentage: 100, count: 5 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      const transportTips = result.filter((r) => r.category === 'transportation');
      expect(transportTips.length).toBeGreaterThan(0);

      // 'Switch to public transit' has estimatedSavingKg = 4.5
      // scaledSaving = 4.5 * (100/50) = 9.0
      // Math.max(9.0, 4.5) = 9.0
      const publicTransitTip = transportTips.find((t) => t.title === 'Switch to public transit');
      expect(publicTransitTip).toBeDefined();
      expect(publicTransitTip!.estimatedSavingKg).toBe(9.0);
    });

    it('should use original saving when scaled saving is lower (low emissions)', async () => {
      // With totalCarbonKg = 10, scaleFactor = 10/50 = 0.2
      // scaledSaving = 4.5 * 0.2 = 0.9
      // Math.max(0.9, 4.5) = 4.5 (uses original)
      const breakdown: ICategoryBreakdown[] = [
        { category: 'transportation', totalCarbonKg: 10, percentage: 100, count: 2 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      const publicTransitTip = result.find((t) => t.title === 'Switch to public transit');
      expect(publicTransitTip).toBeDefined();
      expect(publicTransitTip!.estimatedSavingKg).toBe(4.5);
    });

    it('should sort recommendations by priority weight then by estimatedSavingKg', async () => {
      const breakdown: ICategoryBreakdown[] = [
        { category: 'transportation', totalCarbonKg: 50, percentage: 60, count: 5 },
        { category: 'food', totalCarbonKg: 30, percentage: 40, count: 3 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      // Verify ordering: high priority first, then medium
      for (let i = 0; i < result.length - 1; i++) {
        const pw: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const currentWeight = pw[result[i].priority];
        const nextWeight = pw[result[i + 1].priority];

        if (currentWeight === nextWeight) {
          // Same priority: should be sorted by saving descending
          expect(result[i].estimatedSavingKg).toBeGreaterThanOrEqual(
            result[i + 1].estimatedSavingKg,
          );
        } else {
          // Different priority: higher weight comes first
          expect(currentWeight).toBeGreaterThanOrEqual(nextWeight);
        }
      }
    });

    it('should handle a category not present in ALL_TIPS gracefully', async () => {
      const breakdown: ICategoryBreakdown[] = [
        { category: 'unknown_category', totalCarbonKg: 50, percentage: 100, count: 5 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      // Unknown category yields 0 tips from its own list, so falls to default
      // Since the breakdown had entries but no tips matched, recommendations will be empty
      // and the fallback "no recommendations" path gives generic tips
      expect(result.length).toBe(5); // default tips from each known category
    });

    it('should include correct fields on each recommendation', async () => {
      const breakdown: ICategoryBreakdown[] = [
        { category: 'food', totalCarbonKg: 60, percentage: 100, count: 4 },
      ];
      mockGetCategoryBreakdown.mockResolvedValue(breakdown);

      const result = await service.getRecommendations(userId);

      result.forEach((rec) => {
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('estimatedSavingKg');
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('priority');
        expect(typeof rec.title).toBe('string');
        expect(typeof rec.description).toBe('string');
        expect(typeof rec.estimatedSavingKg).toBe('number');
        expect(['high', 'medium', 'low']).toContain(rec.priority);
      });
    });
  });
});
