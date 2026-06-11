import { activityRepository } from '../repositories/ActivityRepository';
import { getDateRange } from '../utils/helpers';
import type { IAnalyticsSummary, IAnalyticsTrend, ICategoryBreakdown, PeriodType } from '../types';

export class AnalyticsService {
  /**
   * High-level dashboard summary: totals, breakdown, average, period comparison.
   */
  async getSummary(userId: string): Promise<IAnalyticsSummary> {
    const todayRange = getDateRange('day');
    const weekRange = getDateRange('week');
    const monthRange = getDateRange('month');
    const yearRange = getDateRange('year');

    // Previous period ranges for comparison
    const prevWeekStart = new Date(weekRange.start);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekRange.start);
    prevWeekEnd.setMilliseconds(-1);

    const prevMonthStart = new Date(monthRange.start);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthRange.start);
    prevMonthEnd.setMilliseconds(-1);

    const [today, thisWeek, thisMonth, thisYear, breakdown, dailyAverage, prevWeek, prevMonth] =
      await Promise.all([
        activityRepository.getTotalEmissions(userId, todayRange.start, todayRange.end),
        activityRepository.getTotalEmissions(userId, weekRange.start, weekRange.end),
        activityRepository.getTotalEmissions(userId, monthRange.start, monthRange.end),
        activityRepository.getTotalEmissions(userId, yearRange.start, yearRange.end),
        activityRepository.getCategoryBreakdown(userId, monthRange.start, monthRange.end),
        activityRepository.getDailyAverage(userId, 30),
        activityRepository.getTotalEmissions(userId, prevWeekStart, prevWeekEnd),
        activityRepository.getTotalEmissions(userId, prevMonthStart, prevMonthEnd),
      ]);

    const weekOverWeek =
      prevWeek > 0 ? parseFloat((((thisWeek - prevWeek) / prevWeek) * 100).toFixed(2)) : 0;
    const monthOverMonth =
      prevMonth > 0 ? parseFloat((((thisMonth - prevMonth) / prevMonth) * 100).toFixed(2)) : 0;

    return {
      totalEmissions: { today, thisWeek, thisMonth, thisYear },
      categoryBreakdown: breakdown,
      dailyAverage,
      comparison: { weekOverWeek, monthOverMonth },
    };
  }

  /**
   * Time-series data for charts.
   */
  async getTrends(
    userId: string,
    period: PeriodType = 'day',
    rangeDays: number = 30,
  ): Promise<IAnalyticsTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);
    startDate.setHours(0, 0, 0, 0);

    return activityRepository.getEmissionsByPeriod(userId, period, startDate, endDate);
  }

  /**
   * Detailed category breakdown for a specific date range.
   */
  async getBreakdown(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ICategoryBreakdown[]> {
    const range = getDateRange('month');
    const start = startDate ? new Date(startDate) : range.start;
    const end = endDate ? new Date(endDate) : range.end;

    return activityRepository.getCategoryBreakdown(userId, start, end);
  }

  /**
   * Compare current period vs previous period.
   */
  async getComparison(userId: string): Promise<{
    currentWeek: number;
    previousWeek: number;
    weekChange: number;
    currentMonth: number;
    previousMonth: number;
    monthChange: number;
  }> {
    const weekRange = getDateRange('week');
    const monthRange = getDateRange('month');

    const prevWeekStart = new Date(weekRange.start);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekRange.start);
    prevWeekEnd.setMilliseconds(-1);

    const prevMonthStart = new Date(monthRange.start);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(monthRange.start);
    prevMonthEnd.setMilliseconds(-1);

    const [currentWeek, previousWeek, currentMonth, previousMonth] = await Promise.all([
      activityRepository.getTotalEmissions(userId, weekRange.start, weekRange.end),
      activityRepository.getTotalEmissions(userId, prevWeekStart, prevWeekEnd),
      activityRepository.getTotalEmissions(userId, monthRange.start, monthRange.end),
      activityRepository.getTotalEmissions(userId, prevMonthStart, prevMonthEnd),
    ]);

    const weekChange =
      previousWeek > 0
        ? parseFloat((((currentWeek - previousWeek) / previousWeek) * 100).toFixed(2))
        : 0;
    const monthChange =
      previousMonth > 0
        ? parseFloat((((currentMonth - previousMonth) / previousMonth) * 100).toFixed(2))
        : 0;

    return {
      currentWeek,
      previousWeek,
      weekChange,
      currentMonth,
      previousMonth,
      monthChange,
    };
  }
}

export const analyticsService = new AnalyticsService();
