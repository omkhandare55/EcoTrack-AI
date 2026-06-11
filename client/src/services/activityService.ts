import { apiClient } from './apiClient';
import type { Activity, PaginatedResponse, ActivityFormData } from '../types';

export const activityService = {
  async getActivities(params?: Record<string, any>): Promise<PaginatedResponse<Activity>> {
    const res = await apiClient.get<PaginatedResponse<Activity>>('/activities', { params });
    return res.data;
  },

  async createActivity(data: ActivityFormData): Promise<{ activity: Activity }> {
    const res = await apiClient.post<{ status: string; data: { activity: Activity } }>(
      '/activities',
      data,
    );
    return res.data.data;
  },

  async getActivityById(id: string): Promise<{ activity: Activity }> {
    const res = await apiClient.get<{ status: string; data: { activity: Activity } }>(
      `/activities/${id}`,
    );
    return res.data.data;
  },

  async deleteActivity(id: string): Promise<void> {
    await apiClient.delete(`/activities/${id}`);
  },
};
