import { apiClient } from './apiClient';
import type { Goal, GoalFormData } from '../types';

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    const res = await apiClient.get<{ status: string; data: { goals: Goal[] } }>('/goals');
    return res.data.data.goals;
  },

  async createGoal(data: GoalFormData): Promise<{ goal: Goal }> {
    const res = await apiClient.post<{ status: string; data: { goal: Goal } }>('/goals', data);
    return res.data.data;
  },

  async updateGoal(id: string, data: Partial<GoalFormData>): Promise<{ goal: Goal }> {
    const res = await apiClient.patch<{ status: string; data: { goal: Goal } }>(
      `/goals/${id}`,
      data,
    );
    return res.data.data;
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },
};
