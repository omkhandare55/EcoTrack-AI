import { Document, Types } from 'mongoose';

// ─── User ───────────────────────────────────────────────────────────────────

export interface IUserPreferences {
  units: 'metric' | 'imperial';
  notifications: boolean;
  weeklyReport: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  preferences: IUserPreferences;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Activity ───────────────────────────────────────────────────────────────

export interface IActivity extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: ActivityCategory;
  subcategory: string;
  value: number;
  unit: string;
  carbonKg: number;
  date: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Goal ───────────────────────────────────────────────────────────────────

export interface IGoal extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  category: ActivityCategory;
  targetReduction: number;
  currentValue: number;
  baselineValue: number;
  period: GoalPeriod;
  status: GoalStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Challenge ──────────────────────────────────────────────────────────────

export interface IChallenge extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: ActivityCategory;
  difficulty: ChallengeDifficulty;
  points: number;
  estimatedSavingKg: number;
  frequency: ChallengeFrequency;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChallengeProgress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  status: ChallengeProgressStatus;
  streak: number;
  completedDates: Date[];
  lastCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Achievement ────────────────────────────────────────────────────────────

export interface IAchievement extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  badge: string;
  title: string;
  description: string;
  earnedAt: Date;
}

// ─── Emission Factors ───────────────────────────────────────────────────────

export interface ITransportFactors {
  car: number;
  bus: number;
  train: number;
  bicycle: number;
  walking: number;
  motorcycle: number;
  airplane: number;
}

export interface IFoodFactors {
  beef: number;
  chicken: number;
  fish: number;
  vegetables: number;
  dairy: number;
  grains: number;
}

export interface IShoppingFactors {
  clothing: number;
  electronics: number;
  furniture: number;
}

export interface IEmissionFactors {
  transportation: ITransportFactors;
  electricity: number;
  food: IFoodFactors;
  water: number;
  shopping: IShoppingFactors;
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface IAnalyticsSummary {
  totalEmissions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  categoryBreakdown: ICategoryBreakdown[];
  dailyAverage: number;
  comparison: {
    weekOverWeek: number;
    monthOverMonth: number;
  };
}

export interface IAnalyticsTrend {
  date: string;
  totalCarbonKg: number;
  count: number;
}

export interface ICategoryBreakdown {
  category: string;
  totalCarbonKg: number;
  percentage: number;
  count: number;
}

export interface IRecommendation {
  title: string;
  description: string;
  estimatedSavingKg: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface IPrediction {
  period: string;
  predictedCarbonKg: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// ─── JWT ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// ─── Enums ──────────────────────────────────────────────────────────────────

export type ActivityCategory = 'transportation' | 'electricity' | 'food' | 'water' | 'shopping';

export type GoalPeriod = 'weekly' | 'monthly' | 'yearly';

export type GoalStatus = 'active' | 'completed' | 'failed';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type ChallengeFrequency = 'daily' | 'weekly' | 'monthly' | 'one-time';

export type ChallengeProgressStatus = 'in-progress' | 'completed' | 'abandoned';

export type PeriodType = 'day' | 'week' | 'month' | 'year';

// ─── Express Augmentation ───────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
