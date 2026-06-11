import { apiClient } from './apiClient';
import type { Recommendation } from '../types';

export const recommendationService = {
  async getRecommendations(): Promise<Recommendation[]> {
    const res = await apiClient.get<{
      status: string;
      data: { recommendations: Recommendation[] };
    }>('/recommendations');
    return res.data.data.recommendations;
  },
};
