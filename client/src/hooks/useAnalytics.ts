import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsService.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnalyticsTrends = (
  period: 'day' | 'week' | 'month' | 'year',
  rangeDays?: number,
) => {
  return useQuery({
    queryKey: ['analytics', 'trends', period, rangeDays],
    queryFn: () => analyticsService.getTrends(period, rangeDays),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAnalyticsBreakdown = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'breakdown', startDate, endDate],
    queryFn: () => analyticsService.getBreakdown(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
};

export const useComparison = () => {
  return useQuery({
    queryKey: ['analytics', 'comparison'],
    queryFn: () => analyticsService.getComparison(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePredictions = () => {
  return useQuery({
    queryKey: ['analytics', 'predictions'],
    queryFn: () => analyticsService.getPredictions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
