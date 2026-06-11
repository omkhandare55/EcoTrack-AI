import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { activityService } from '../services/activityService';
import type { Activity, PaginatedResponse, ActivityFormData } from '../types';

export const useActivities = (
  params?: Record<string, unknown>,
): UseQueryResult<PaginatedResponse<Activity>, Error> => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => activityService.getActivities(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateActivity = (): UseMutationResult<
  { activity: Activity },
  Error,
  ActivityFormData,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActivityFormData) => activityService.createActivity(data),
    onSuccess: () => {
      // Invalidate activities and analytics queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['me'] }); // For new achievements
    },
  });
};

export const useDeleteActivity = (): UseMutationResult<void, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activityService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
};
