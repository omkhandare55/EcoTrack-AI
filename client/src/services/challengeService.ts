import { apiClient } from './apiClient';
import type { Challenge, ChallengeProgress } from '../types';

export const challengeService = {
  async getChallenges(): Promise<Challenge[]> {
    const res = await apiClient.get<{ status: string; data: { challenges: Challenge[] } }>(
      '/challenges',
    );
    return res.data.data.challenges;
  },

  async getProgress(): Promise<ChallengeProgress[]> {
    const res = await apiClient.get<{ status: string; data: { progress: ChallengeProgress[] } }>(
      '/challenges/progress',
    );
    return res.data.data.progress;
  },

  async completeChallenge(id: string): Promise<{ progress: ChallengeProgress }> {
    const res = await apiClient.post<{ status: string; data: { progress: ChallengeProgress } }>(
      `/challenges/${id}/complete`,
    );
    return res.data.data;
  },

  async getLeaderboard(limit?: number): Promise<any[]> {
    const res = await apiClient.get<{ status: string; data: { leaderboard: any[] } }>(
      '/challenges/leaderboard',
      {
        params: { limit },
      },
    );
    return res.data.data.leaderboard;
  },
};
