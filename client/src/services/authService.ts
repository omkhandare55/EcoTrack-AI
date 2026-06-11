import { apiClient } from './apiClient';
import type { User, LoginCredentials, RegisterData } from '../types';

export const authService = {
  async register(data: RegisterData): Promise<{ user: User }> {
    const res = await apiClient.post<{ status: string; data: { user: User } }>(
      '/auth/register',
      data,
    );
    return res.data.data;
  },

  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const res = await apiClient.post<{ status: string; data: { user: User } }>(
      '/auth/login',
      credentials,
    );
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<{ user: User }> {
    const res = await apiClient.get<{ status: string; data: { user: User } }>('/auth/me');
    return res.data.data;
  },
};
