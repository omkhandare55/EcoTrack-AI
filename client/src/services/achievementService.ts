import { apiClient } from './apiClient';
import type { Achievement } from '../types';

export const achievementService = {
  async getAchievements(): Promise<Achievement[]> {
    const res = await apiClient.get<{ status: string; data: { achievements: Achievement[] } }>(
      '/achievements',
    );
    return res.data.data.achievements;
  },
};
