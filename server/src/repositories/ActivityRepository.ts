import { FilterQuery, PipelineStage } from 'mongoose';
import Activity from '../models/Activity';
import type { IActivity, ICategoryBreakdown, IAnalyticsTrend, PeriodType } from '../types';
import { BaseRepository, FindManyOptions } from './BaseRepository';

interface ActivityFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
}

export class ActivityRepository extends BaseRepository<IActivity> {
  constructor() {
    super(Activity);
  }

  /**
   * Retrieves a paginated and filtered list of activities for a specific user.
   * Supports filtering by category and date ranges.
   * 
   * @param userId - The unique ID of the user.
   * @param options - Pagination options, sorting constraints, and filter fields.
   * @returns A promise resolving to a paginated response of activity documents.
   */
  async findByUserId(userId: string, options: FindManyOptions & ActivityFilters = {}) {
    const filter: FilterQuery<IActivity> = { userId };

    if (options.category) {
      filter.category = options.category;
    }

    if (options.startDate || options.endDate) {
      filter.date = {};
      if (options.startDate) filter.date.$gte = new Date(options.startDate);
      if (options.endDate) filter.date.$lte = new Date(options.endDate);
    }

    return this.findMany(filter, {
      page: options.page,
      limit: options.limit,
      sort: options.sort ?? '-date',
    });
  }

  /**
   * Aggregates total carbon emissions grouped by a specific time period (day, week, month, year)
   * for a user within a specified timeframe.
   * 
   * @param userId - The unique ID of the user.
   * @param period - The grouping time period ('day', 'week', 'month', 'year').
   * @param startDate - The starting boundary date.
   * @param endDate - The ending boundary date.
   * @returns A promise resolving to an array of trend points containing dates, emission totals, and activity counts.
   */
  async getEmissionsByPeriod(
    userId: string,
    period: PeriodType,
    startDate: Date,
    endDate: Date,
  ): Promise<IAnalyticsTrend[]> {
    const dateFormat = this.getDateFormatString(period);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: Activity.base.Types.ObjectId.createFromHexString(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$date' } },
          totalCarbonKg: { $sum: '$carbonKg' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalCarbonKg: { $round: ['$totalCarbonKg', 4] },
          count: 1,
        },
      },
    ];

    return Activity.aggregate<IAnalyticsTrend>(pipeline).exec();
  }

  /**
   * Computes category-wise emission totals and percentages for a specific user and timeframe.
   * 
   * @param userId - The unique ID of the user.
   * @param startDate - The starting boundary date.
   * @param endDate - The ending boundary date.
   * @returns A promise resolving to an array of category breakdown summaries, sorted by total emissions descending.
   */
  async getCategoryBreakdown(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ICategoryBreakdown[]> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: Activity.base.Types.ObjectId.createFromHexString(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalCarbonKg: { $sum: '$carbonKg' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalCarbonKg: -1 } },
    ];

    const results = await Activity.aggregate<{
      _id: string;
      totalCarbonKg: number;
      count: number;
    }>(pipeline).exec();

    const grandTotal = results.reduce((sum, r) => sum + r.totalCarbonKg, 0);

    return results.map((r) => ({
      category: r._id,
      totalCarbonKg: parseFloat(r.totalCarbonKg.toFixed(4)),
      percentage:
        grandTotal > 0 ? parseFloat(((r.totalCarbonKg / grandTotal) * 100).toFixed(2)) : 0,
      count: r.count,
    }));
  }

  /**
   * Computes the grand total carbon emissions (in kg) for a specific user and timeframe.
   * 
   * @param userId - The unique ID of the user.
   * @param startDate - The starting boundary date.
   * @param endDate - The ending boundary date.
   * @returns A promise resolving to the total carbon emissions in kg.
   */
  async getTotalEmissions(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: Activity.base.Types.ObjectId.createFromHexString(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$carbonKg' },
        },
      },
    ];

    const result = await Activity.aggregate<{ total: number }>(pipeline).exec();
    return result.length > 0 ? parseFloat(result[0].total.toFixed(4)) : 0;
  }

  /**
   * Computes the daily average carbon emissions (in kg/day) for a specific user over the last N days.
   * 
   * @param userId - The unique ID of the user.
   * @param days - The number of days to look back.
   * @returns A promise resolving to the calculated daily average.
   */
  async getDailyAverage(userId: string, days: number): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const total = await this.getTotalEmissions(userId, startDate, new Date());

    return parseFloat((total / days).toFixed(4));
  }

  // ─── Private helpers ────────────────────────────────────────────────

  private getDateFormatString(period: PeriodType): string {
    switch (period) {
      case 'day':
        return '%Y-%m-%d';
      case 'week':
        return '%Y-W%V';
      case 'month':
        return '%Y-%m';
      case 'year':
        return '%Y';
    }
  }
}

export const activityRepository = new ActivityRepository();
