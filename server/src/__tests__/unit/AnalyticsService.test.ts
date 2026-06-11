import type { IAnalyticsTrend, ICategoryBreakdown } from '../../types';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../repositories/ActivityRepository', () => ({
  activityRepository: {
    getTotalEmissions: jest.fn(),
    getCategoryBreakdown: jest.fn(),
    getDailyAverage: jest.fn(),
    getEmissionsByPeriod: jest.fn(),
  },
}));

jest.mock('../../utils/helpers', () => ({
  getDateRange: jest.fn(),
}));

// ─── Imports (after mocks) ──────────────────────────────────────────────────

import { AnalyticsService } from '../../services/AnalyticsService';
import { activityRepository } from '../../repositories/ActivityRepository';
import { getDateRange } from '../../utils/helpers';

const mockedRepo = activityRepository as jest.Mocked<typeof activityRepository>;
const mockedGetDateRange = getDateRange as jest.MockedFunction<typeof getDateRange>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeDateRange(startIso: string, endIso: string) {
  return { start: new Date(startIso), end: new Date(endIso) };
}

// ─── Test Suite ─────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const userId = '6652a1f0b4e5c71a2d3f0001';

  beforeEach(() => {
    service = new AnalyticsService();
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getSummary
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getSummary', () => {
    const dayRange = makeDateRange('2026-06-11T00:00:00Z', '2026-06-11T23:59:59.999Z');
    const weekRange = makeDateRange('2026-06-08T00:00:00Z', '2026-06-11T23:59:59.999Z');
    const monthRange = makeDateRange('2026-06-01T00:00:00Z', '2026-06-11T23:59:59.999Z');
    const yearRange = makeDateRange('2026-01-01T00:00:00Z', '2026-06-11T23:59:59.999Z');

    const breakdown: ICategoryBreakdown[] = [
      { category: 'transportation', totalCarbonKg: 50, percentage: 62.5, count: 5 },
      { category: 'food', totalCarbonKg: 30, percentage: 37.5, count: 3 },
    ];

    beforeEach(() => {
      // getDateRange is called 4 times: day, week, month, year
      mockedGetDateRange
        .mockReturnValueOnce(dayRange) // day
        .mockReturnValueOnce(weekRange) // week
        .mockReturnValueOnce(monthRange) // month
        .mockReturnValueOnce(yearRange); // year
    });

    it('should return the correct summary structure with all fields', async () => {
      // getTotalEmissions called 4 times for current periods + 2 for previous
      // Order: today, thisWeek, thisMonth, thisYear, prevWeek, prevMonth
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(5) // today
        .mockResolvedValueOnce(30) // thisWeek
        .mockResolvedValueOnce(100) // thisMonth
        .mockResolvedValueOnce(500) // thisYear
        .mockResolvedValueOnce(20) // prevWeek
        .mockResolvedValueOnce(80); // prevMonth

      mockedRepo.getCategoryBreakdown.mockResolvedValue(breakdown);
      mockedRepo.getDailyAverage.mockResolvedValue(3.33);

      const result = await service.getSummary(userId);

      expect(result.totalEmissions).toEqual({
        today: 5,
        thisWeek: 30,
        thisMonth: 100,
        thisYear: 500,
      });
      expect(result.categoryBreakdown).toBe(breakdown);
      expect(result.dailyAverage).toBe(3.33);

      // weekOverWeek: ((30-20)/20)*100 = 50.00
      expect(result.comparison.weekOverWeek).toBe(50);
      // monthOverMonth: ((100-80)/80)*100 = 25.00
      expect(result.comparison.monthOverMonth).toBe(25);
    });

    it('should calculate negative percentage when current < previous', async () => {
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(2) // today
        .mockResolvedValueOnce(15) // thisWeek
        .mockResolvedValueOnce(60) // thisMonth
        .mockResolvedValueOnce(300) // thisYear
        .mockResolvedValueOnce(30) // prevWeek
        .mockResolvedValueOnce(100); // prevMonth

      mockedRepo.getCategoryBreakdown.mockResolvedValue([]);
      mockedRepo.getDailyAverage.mockResolvedValue(2);

      const result = await service.getSummary(userId);

      // weekOverWeek: ((15-30)/30)*100 = -50
      expect(result.comparison.weekOverWeek).toBe(-50);
      // monthOverMonth: ((60-100)/100)*100 = -40
      expect(result.comparison.monthOverMonth).toBe(-40);
    });

    it('should return 0 for comparisons when previous period emissions are zero (no division by zero)', async () => {
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(5) // today
        .mockResolvedValueOnce(30) // thisWeek
        .mockResolvedValueOnce(100) // thisMonth
        .mockResolvedValueOnce(500) // thisYear
        .mockResolvedValueOnce(0) // prevWeek = 0
        .mockResolvedValueOnce(0); // prevMonth = 0

      mockedRepo.getCategoryBreakdown.mockResolvedValue([]);
      mockedRepo.getDailyAverage.mockResolvedValue(0);

      const result = await service.getSummary(userId);

      expect(result.comparison.weekOverWeek).toBe(0);
      expect(result.comparison.monthOverMonth).toBe(0);
    });

    it('should call getDateRange with the correct period types', async () => {
      mockedRepo.getTotalEmissions.mockResolvedValue(0);
      mockedRepo.getCategoryBreakdown.mockResolvedValue([]);
      mockedRepo.getDailyAverage.mockResolvedValue(0);

      await service.getSummary(userId);

      expect(mockedGetDateRange).toHaveBeenCalledWith('day');
      expect(mockedGetDateRange).toHaveBeenCalledWith('week');
      expect(mockedGetDateRange).toHaveBeenCalledWith('month');
      expect(mockedGetDateRange).toHaveBeenCalledWith('year');
    });

    it('should call getDailyAverage with 30 days', async () => {
      mockedRepo.getTotalEmissions.mockResolvedValue(0);
      mockedRepo.getCategoryBreakdown.mockResolvedValue([]);
      mockedRepo.getDailyAverage.mockResolvedValue(0);

      await service.getSummary(userId);

      expect(mockedRepo.getDailyAverage).toHaveBeenCalledWith(userId, 30);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getTrends
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getTrends', () => {
    const trendData: IAnalyticsTrend[] = [
      { date: '2026-06-10', totalCarbonKg: 12.5, count: 3 },
      { date: '2026-06-11', totalCarbonKg: 8.2, count: 2 },
    ];

    it('should pass correct parameters to getEmissionsByPeriod', async () => {
      mockedRepo.getEmissionsByPeriod.mockResolvedValue(trendData);

      const result = await service.getTrends(userId, 'week', 14);

      expect(mockedRepo.getEmissionsByPeriod).toHaveBeenCalledWith(
        userId,
        'week',
        expect.any(Date),
        expect.any(Date),
      );
      expect(result).toBe(trendData);
    });

    it('should use default period "day" when not provided', async () => {
      mockedRepo.getEmissionsByPeriod.mockResolvedValue(trendData);

      await service.getTrends(userId);

      expect(mockedRepo.getEmissionsByPeriod).toHaveBeenCalledWith(
        userId,
        'day',
        expect.any(Date),
        expect.any(Date),
      );
    });

    it('should use default rangeDays of 30 when not provided', async () => {
      mockedRepo.getEmissionsByPeriod.mockResolvedValue(trendData);

      const before = new Date();
      before.setDate(before.getDate() - 30);
      before.setHours(0, 0, 0, 0);

      await service.getTrends(userId);

      const [, , startDate] = mockedRepo.getEmissionsByPeriod.mock.calls[0];
      // startDate should be approximately 30 days ago at midnight
      expect(startDate.getHours()).toBe(0);
      expect(startDate.getMinutes()).toBe(0);
      expect(startDate.getSeconds()).toBe(0);
      expect(startDate.getMilliseconds()).toBe(0);
      // Allow a few ms of difference
      expect(Math.abs(startDate.getTime() - before.getTime())).toBeLessThan(5000);
    });

    it('should calculate start date based on custom rangeDays', async () => {
      mockedRepo.getEmissionsByPeriod.mockResolvedValue([]);

      const customDays = 7;
      const expectedStart = new Date();
      expectedStart.setDate(expectedStart.getDate() - customDays);
      expectedStart.setHours(0, 0, 0, 0);

      await service.getTrends(userId, 'day', customDays);

      const [, , startDate] = mockedRepo.getEmissionsByPeriod.mock.calls[0];
      expect(Math.abs(startDate.getTime() - expectedStart.getTime())).toBeLessThan(5000);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getBreakdown
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getBreakdown', () => {
    const monthRange = makeDateRange('2026-06-01T00:00:00Z', '2026-06-30T23:59:59.999Z');
    const breakdownResult: ICategoryBreakdown[] = [
      { category: 'electricity', totalCarbonKg: 40, percentage: 100, count: 10 },
    ];

    beforeEach(() => {
      mockedGetDateRange.mockReturnValue(monthRange);
    });

    it('should use provided start and end dates when given', async () => {
      mockedRepo.getCategoryBreakdown.mockResolvedValue(breakdownResult);

      const startStr = '2026-03-01T00:00:00.000Z';
      const endStr = '2026-03-31T23:59:59.999Z';

      const result = await service.getBreakdown(userId, startStr, endStr);

      expect(mockedRepo.getCategoryBreakdown).toHaveBeenCalledWith(
        userId,
        new Date(startStr),
        new Date(endStr),
      );
      expect(result).toBe(breakdownResult);
    });

    it('should default to current month range when dates are not provided', async () => {
      mockedRepo.getCategoryBreakdown.mockResolvedValue(breakdownResult);

      const result = await service.getBreakdown(userId);

      expect(mockedGetDateRange).toHaveBeenCalledWith('month');
      expect(mockedRepo.getCategoryBreakdown).toHaveBeenCalledWith(
        userId,
        monthRange.start,
        monthRange.end,
      );
      expect(result).toBe(breakdownResult);
    });

    it('should use default end date when only startDate is provided', async () => {
      mockedRepo.getCategoryBreakdown.mockResolvedValue(breakdownResult);

      const startStr = '2026-05-01T00:00:00.000Z';
      await service.getBreakdown(userId, startStr);

      expect(mockedRepo.getCategoryBreakdown).toHaveBeenCalledWith(
        userId,
        new Date(startStr),
        monthRange.end, // defaults
      );
    });

    it('should use default start date when only endDate is provided', async () => {
      mockedRepo.getCategoryBreakdown.mockResolvedValue(breakdownResult);

      const endStr = '2026-06-15T23:59:59.999Z';
      await service.getBreakdown(userId, undefined, endStr);

      expect(mockedRepo.getCategoryBreakdown).toHaveBeenCalledWith(
        userId,
        monthRange.start, // defaults
        new Date(endStr),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // getComparison
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getComparison', () => {
    const weekRange = makeDateRange('2026-06-08T00:00:00Z', '2026-06-11T23:59:59.999Z');
    const monthRange = makeDateRange('2026-06-01T00:00:00Z', '2026-06-11T23:59:59.999Z');

    beforeEach(() => {
      mockedGetDateRange.mockReturnValueOnce(weekRange).mockReturnValueOnce(monthRange);
    });

    it('should calculate percentage changes correctly', async () => {
      // Order: currentWeek, previousWeek, currentMonth, previousMonth
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(40) // currentWeek
        .mockResolvedValueOnce(50) // previousWeek
        .mockResolvedValueOnce(150) // currentMonth
        .mockResolvedValueOnce(100); // previousMonth

      const result = await service.getComparison(userId);

      expect(result.currentWeek).toBe(40);
      expect(result.previousWeek).toBe(50);
      // weekChange: ((40-50)/50)*100 = -20
      expect(result.weekChange).toBe(-20);

      expect(result.currentMonth).toBe(150);
      expect(result.previousMonth).toBe(100);
      // monthChange: ((150-100)/100)*100 = 50
      expect(result.monthChange).toBe(50);
    });

    it('should return 0 for weekChange when previousWeek is zero', async () => {
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(25) // currentWeek
        .mockResolvedValueOnce(0) // previousWeek = 0
        .mockResolvedValueOnce(80) // currentMonth
        .mockResolvedValueOnce(40); // previousMonth

      const result = await service.getComparison(userId);

      expect(result.weekChange).toBe(0);
      expect(result.monthChange).toBe(100); // ((80-40)/40)*100
    });

    it('should return 0 for monthChange when previousMonth is zero', async () => {
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(20) // currentWeek
        .mockResolvedValueOnce(10) // previousWeek
        .mockResolvedValueOnce(50) // currentMonth
        .mockResolvedValueOnce(0); // previousMonth = 0

      const result = await service.getComparison(userId);

      expect(result.weekChange).toBe(100); // ((20-10)/10)*100
      expect(result.monthChange).toBe(0);
    });

    it('should return 0 for both changes when both previous values are zero', async () => {
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(10) // currentWeek
        .mockResolvedValueOnce(0) // previousWeek = 0
        .mockResolvedValueOnce(30) // currentMonth
        .mockResolvedValueOnce(0); // previousMonth = 0

      const result = await service.getComparison(userId);

      expect(result.weekChange).toBe(0);
      expect(result.monthChange).toBe(0);
    });

    it('should return all six fields in the result', async () => {
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(50);

      const result = await service.getComparison(userId);

      expect(result).toHaveProperty('currentWeek');
      expect(result).toHaveProperty('previousWeek');
      expect(result).toHaveProperty('weekChange');
      expect(result).toHaveProperty('currentMonth');
      expect(result).toHaveProperty('previousMonth');
      expect(result).toHaveProperty('monthChange');
    });

    it('should handle fractional percentage changes with two decimal places', async () => {
      mockedRepo.getTotalEmissions
        .mockResolvedValueOnce(33) // currentWeek
        .mockResolvedValueOnce(25) // previousWeek
        .mockResolvedValueOnce(77) // currentMonth
        .mockResolvedValueOnce(60); // previousMonth

      const result = await service.getComparison(userId);

      // weekChange: ((33-25)/25)*100 = 32.00
      expect(result.weekChange).toBe(32);
      // monthChange: ((77-60)/60)*100 = 28.33
      expect(result.monthChange).toBe(28.33);
    });
  });
});
