import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { challengeService } from '../services/challengeService';
import type { Challenge, ChallengeProgress, LeaderboardEntry } from '../types';

export const useChallenges = (): UseQueryResult<Challenge[], Error> => {
  return useQuery({
    queryKey: ['challenges', 'list'],
    queryFn: () => challengeService.getChallenges(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useChallengeProgress = (): UseQueryResult<ChallengeProgress[], Error> => {
  return useQuery({
    queryKey: ['challenges', 'progress'],
    queryFn: () => challengeService.getProgress(),
    staleTime: 1 * 60 * 1000,
  });
};

export const useCompleteChallenge = (): UseMutationResult<
  { progress: ChallengeProgress },
  Error,
  string,
  unknown
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => challengeService.completeChallenge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['me'] }); // Recalculate achievements
    },
  });
};

export const useLeaderboard = (limit?: number): UseQueryResult<LeaderboardEntry[], Error> => {
  return useQuery({
    queryKey: ['challenges', 'leaderboard', limit],
    queryFn: () => challengeService.getLeaderboard(limit),
    staleTime: 5 * 60 * 1000,
  });
};
