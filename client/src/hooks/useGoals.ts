import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { goalService } from '../services/goalService';
import type { Goal, GoalFormData } from '../types';

export const useGoals = (): UseQueryResult<Goal[], Error> => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getGoals(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateGoal = (): UseMutationResult<
  { goal: Goal },
  Error,
  GoalFormData,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoalFormData) => goalService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useUpdateGoal = (): UseMutationResult<
  { goal: Goal },
  Error,
  { id: string; data: Partial<GoalFormData> },
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GoalFormData> }) =>
      goalService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

export const useDeleteGoal = (): UseMutationResult<void, Error, string, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};
