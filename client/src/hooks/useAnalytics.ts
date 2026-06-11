import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsSummary, AnalyticsTrend, CategoryBreakdown, Prediction } from '../types';

export const useAnalyticsSummary = (): UseQueryResult<AnalyticsSummary, Error> => {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsService.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnalyticsTrends = (
  period: 'day' | 'week' | 'month' | 'year',
  rangeDays?: number,
): UseQueryResult<AnalyticsTrend[], Error> => {
  return useQuery({
    queryKey: ['analytics', 'trends', period, rangeDays],
    queryFn: () => analyticsService.getTrends(period, rangeDays),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnalyticsBreakdown = (
  startDate?: string,
  endDate?: string,
): UseQueryResult<CategoryBreakdown[], Error> => {
  return useQuery({
    queryKey: ['analytics', 'breakdown', startDate, endDate],
    queryFn: () => analyticsService.getBreakdown(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
};

export interface ComparisonData {
  currentWeek: number;
  previousWeek: number;
  weekChange: number;
  currentMonth: number;
  previousMonth: number;
  monthChange: number;
}

export const useComparison = (): UseQueryResult<ComparisonData, Error> => {
  return useQuery({
    queryKey: ['analytics', 'comparison'],
    queryFn: () => analyticsService.getComparison(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePredictions = (): UseQueryResult<Prediction, Error> => {
  return useQuery({
    queryKey: ['analytics', 'predictions'],
    queryFn: () => analyticsService.getPredictions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
