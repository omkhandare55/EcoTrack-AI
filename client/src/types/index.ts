// ─── User ───────────────────────────────────────────────────────────────────

export interface UserPreferences {
  units: 'metric' | 'imperial';
  notifications: boolean;
  weeklyReport: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
}

// ─── Activity ───────────────────────────────────────────────────────────────

export interface Activity {
  _id: string;
  userId: string;
  category: ActivityCategory;
  subcategory: string;
  value: number;
  unit: string;
  carbonKg: number;
  date: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 'transportation' | 'electricity' | 'food' | 'water' | 'shopping';

export interface ActivityFormData {
  category: ActivityCategory;
  subcategory: string;
  value: number;
  unit: string;
  date?: string;
  metadata?: Record<string, unknown>;
}

// ─── Goal ───────────────────────────────────────────────────────────────────

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  category: ActivityCategory;
  targetReduction: number;
  currentValue: number;
  baselineValue: number;
  period: GoalPeriod;
  status: GoalStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalPeriod = 'weekly' | 'monthly' | 'yearly';
export type GoalStatus = 'active' | 'completed' | 'failed';

export interface GoalFormData {
  title: string;
  category: ActivityCategory;
  targetReduction: number;
  period: GoalPeriod;
  startDate?: string;
  endDate?: string;
}

// ─── Challenge ──────────────────────────────────────────────────────────────

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  estimatedSavingKg: number;
  frequency: ChallengeFrequency;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeProgress {
  _id: string;
  userId: string;
  challengeId: string;
  status: ChallengeProgressStatus;
  streak: number;
  completedDates: string[];
  lastCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeFrequency = 'daily' | 'weekly' | 'monthly' | 'one-time';
export type ChallengeProgressStatus = 'in-progress' | 'completed' | 'abandoned';

// ─── Achievement ────────────────────────────────────────────────────────────

export interface Achievement {
  _id: string;
  userId: string;
  badge: string;
  title: string;
  description: string;
  earnedAt: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalEmissions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  categoryBreakdown: CategoryBreakdown[];
  dailyAverage: number;
  comparison: {
    weekOverWeek: number;
    monthOverMonth: number;
  };
}

export interface AnalyticsTrend {
  date: string;
  totalCarbonKg: number;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  totalCarbonKg: number;
  percentage: number;
  count: number;
}

export interface Recommendation {
  title: string;
  description: string;
  estimatedSavingKg: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Prediction {
  period: string;
  predictedCarbonKg: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
}
