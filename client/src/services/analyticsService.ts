import { apiClient } from './apiClient';
import type { AnalyticsSummary, AnalyticsTrend, CategoryBreakdown, Prediction } from '../types';

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    const res = await apiClient.get<{ status: string; data: { summary: AnalyticsSummary } }>(
      '/analytics/summary',
    );
    return res.data.data.summary;
  },

  async getTrends(
    period: 'day' | 'week' | 'month' | 'year',
    rangeDays?: number,
  ): Promise<AnalyticsTrend[]> {
    const res = await apiClient.get<{ status: string; data: { trends: AnalyticsTrend[] } }>(
      '/analytics/trends',
      {
        params: { period, rangeDays },
      },
    );
    return res.data.data.trends;
  },

  async getBreakdown(startDate?: string, endDate?: string): Promise<CategoryBreakdown[]> {
    const res = await apiClient.get<{ status: string; data: { breakdown: CategoryBreakdown[] } }>(
      '/analytics/breakdown',
      {
        params: { startDate, endDate },
      },
    );
    return res.data.data.breakdown;
  },

  async getComparison(): Promise<{
    currentWeek: number;
    previousWeek: number;
    weekChange: number;
    currentMonth: number;
    previousMonth: number;
    monthChange: number;
  }> {
    const res = await apiClient.get<{
      status: string;
      data: {
        comparison: {
          currentWeek: number;
          previousWeek: number;
          weekChange: number;
          currentMonth: number;
          previousMonth: number;
          monthChange: number;
        };
      };
    }>('/analytics/comparison');
    return res.data.data.comparison;
  },

  async getPredictions(): Promise<Prediction> {
    const res = await apiClient.get<{ status: string; data: { prediction: Prediction } }>(
      '/analytics/predictions',
    );
    return res.data.data.prediction;
  },
};
