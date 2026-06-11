import { PredictionService } from '../../services/PredictionService';
import { activityRepository } from '../../repositories/ActivityRepository';

jest.mock('../../repositories/ActivityRepository', () => ({
  activityRepository: {
    getEmissionsByPeriod: jest.fn(),
  },
}));

describe('PredictionService Unit Tests', () => {
  let predictionService: PredictionService;

  beforeEach(() => {
    predictionService = new PredictionService();
    jest.clearAllMocks();
  });

  describe('linearRegression', () => {
    it('should return 0 slope and 0 intercept for empty array', () => {
      const result = predictionService.linearRegression([]);
      expect(result).toEqual({ slope: 0, intercept: 0 });
    });

    it('should return 0 slope and intercept equal to value for single element array', () => {
      const result = predictionService.linearRegression([42]);
      expect(result).toEqual({ slope: 0, intercept: 42 });
    });

    it('should calculate correct slope and intercept for a linear trend', () => {
      // y = 2x + 10 => data = [10, 12, 14, 16] for x = 0, 1, 2, 3
      const result = predictionService.linearRegression([10, 12, 14, 16]);
      expect(result.slope).toBeCloseTo(2);
      expect(result.intercept).toBeCloseTo(10);
    });

    it('should return slope and intercept for identical elements', () => {
      const result = predictionService.linearRegression([5, 5, 5]);
      expect(result.slope).toBeCloseTo(0);
      expect(result.intercept).toBeCloseTo(5);
    });
  });

  describe('movingAverage', () => {
    it('should return empty array for empty inputs', () => {
      expect(predictionService.movingAverage([], 3)).toEqual([]);
    });

    it('should calculate moving average correctly', () => {
      const result = predictionService.movingAverage([10, 20, 30, 40], 2);
      expect(result).toEqual([15, 25, 35]); // (10+20)/2, (20+30)/2, (30+40)/2
    });

    it('should clamp window size to data length if window exceeds it', () => {
      const result = predictionService.movingAverage([10, 20], 5);
      expect(result).toEqual([15]); // (10+20)/2
    });
  });

  describe('predictEmissions', () => {
    it('should fall back to average if there is less than 2 months of data', async () => {
      (activityRepository.getEmissionsByPeriod as jest.Mock).mockResolvedValue([
        { totalCarbonKg: 150 },
      ]);

      const result = await predictionService.predictEmissions('user-123');
      expect(result.predictedCarbonKg).toBe(150);
      expect(result.confidence).toBe(0.3);
      expect(result.trend).toBe('stable');
    });

    it('should predict emissions and determine trend for sufficient data', async () => {
      (activityRepository.getEmissionsByPeriod as jest.Mock).mockResolvedValue([
        { totalCarbonKg: 100 },
        { totalCarbonKg: 120 },
        { totalCarbonKg: 140 },
      ]);

      const result = await predictionService.predictEmissions('user-123');
      expect(result.predictedCarbonKg).toBeGreaterThan(140);
      expect(result.confidence).toBeCloseTo(0.7);
      expect(result.trend).toBe('increasing');
    });

    it('should clamp prediction to 0 if linear regression predicts negative value', async () => {
      (activityRepository.getEmissionsByPeriod as jest.Mock).mockResolvedValue([
        { totalCarbonKg: 10 },
        { totalCarbonKg: 5 },
        { totalCarbonKg: 1 },
      ]);

      const result = await predictionService.predictEmissions('user-123');
      expect(result.predictedCarbonKg).toBe(0);
      expect(result.trend).toBe('decreasing');
    });
  });

  describe('getTrend', () => {
    it('should return stable if there are fewer than 2 data points', async () => {
      (activityRepository.getEmissionsByPeriod as jest.Mock).mockResolvedValue([
        { totalCarbonKg: 50 },
      ]);
      const result = await predictionService.getTrend('user-123');
      expect(result).toBe('stable');
    });

    it('should determine increasing trend correctly', async () => {
      (activityRepository.getEmissionsByPeriod as jest.Mock).mockResolvedValue([
        { totalCarbonKg: 50 },
        { totalCarbonKg: 100 },
        { totalCarbonKg: 150 },
      ]);
      const result = await predictionService.getTrend('user-123');
      expect(result).toBe('increasing');
    });

    it('should determine decreasing trend correctly', async () => {
      (activityRepository.getEmissionsByPeriod as jest.Mock).mockResolvedValue([
        { totalCarbonKg: 150 },
        { totalCarbonKg: 100 },
        { totalCarbonKg: 50 },
      ]);
      const result = await predictionService.getTrend('user-123');
      expect(result).toBe('decreasing');
    });
  });
});
