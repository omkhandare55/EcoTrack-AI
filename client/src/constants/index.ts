import type { ActivityCategory } from '../types';

// ── Activity Categories ───────────────────────────────────────────────────────
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'transportation',
  'electricity',
  'food',
  'water',
  'shopping',
];

export const CATEGORY_DETAILS: {
  value: ActivityCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: 'transportation', label: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { value: 'electricity', label: 'Electricity', icon: '⚡', color: '#f59e0b' },
  { value: 'food', label: 'Food', icon: '🍽️', color: '#10b981' },
  { value: 'water', label: 'Water', icon: '💧', color: '#06b6d4' },
  { value: 'shopping', label: 'Shopping', icon: '🛒', color: '#8b5cf6' },
];

export const GOAL_PERIODS = ['weekly', 'monthly', 'yearly'] as const;

export const GOAL_STATUSES = ['active', 'completed', 'failed'] as const;

// ── Chart Colors ──────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  emerald: '#10b981',
  emeraldLight: '#34d399',
  emeraldDark: '#059669',
  teal: '#14b8a6',
  tealLight: '#2dd4bf',
  cyan: '#06b6d4',
  cyanLight: '#22d3ee',
  blue: '#3b82f6',
  blueLight: '#60a5fa',
  violet: '#8b5cf6',
  violetLight: '#a78bfa',
  amber: '#f59e0b',
  amberLight: '#fbbf24',
  rose: '#f43f5e',
  roseLight: '#fb7185',
  slate: '#64748b',
};

export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transportation: CHART_COLORS.blue,
  electricity: CHART_COLORS.amber,
  food: CHART_COLORS.emerald,
  water: CHART_COLORS.cyan,
  shopping: CHART_COLORS.violet,
};

export const CHART_PALETTE = [
  CHART_COLORS.emerald,
  CHART_COLORS.cyan,
  CHART_COLORS.blue,
  CHART_COLORS.violet,
  CHART_COLORS.amber,
  CHART_COLORS.rose,
  CHART_COLORS.teal,
  CHART_COLORS.emeraldLight,
  CHART_COLORS.blueLight,
  CHART_COLORS.violetLight,
];
