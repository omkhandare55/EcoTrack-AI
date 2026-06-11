import { activityRepository } from '../repositories/ActivityRepository';
import { getDateRange } from '../utils/helpers';
import type { IAnalyticsSummary, IAnalyticsTrend, ICategoryBreakdown, PeriodType } from '../types';

export class AnalyticsService {
  /**
   * Generates a high-level dashboard summary for a user, including:
   * - Total emissions for today, this week, this month, and this year.
   * - Category-wise carbon footprint breakdown for the current month.
   * - Daily average carbon emissions over the last 30 days.
   * - Comparison metrics showing week-over-week and month-over-month percentage changes.
   * 
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to the user's detailed emission analytics summary.
   * @throws {AppError} If there is a database error or invalid query state.
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
   * Retrieves aggregated time-series carbon emission trends for charts.
   * 
   * @param userId - The unique ID of the user.
   * @param period - The grouping time period ('day', 'week', 'month', 'year'). Defaults to 'day'.
   * @param rangeDays - The number of historical days to fetch trend data for. Defaults to 30.
   * @returns A promise resolving to an array of trend points with dates and total carbon values.
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
   * Retrieves a detailed category-wise carbon footprint breakdown for a specific date range.
   * Defaults to the current month if date filters are not provided.
   * 
   * @param userId - The unique ID of the user.
   * @param startDate - Optional starting boundary date string (ISO format).
   * @param endDate - Optional ending boundary date string (ISO format).
   * @returns A promise resolving to an array of categories with emission weights and percentages.
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
   * Compares the user's current week and month emissions with their previous week and month.
   * Calculates absolute emission values and percentage differences.
   * 
   * @param userId - The unique ID of the user.
   * @returns A promise resolving to comparison statistics for weeks and months.
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
