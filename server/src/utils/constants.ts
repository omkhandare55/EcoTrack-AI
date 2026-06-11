// ─── Activity Categories ────────────────────────────────────────────────────

export const ACTIVITY_CATEGORIES = [
  'transportation',
  'electricity',
  'food',
  'water',
  'shopping',
] as const;

export type ActivityCategoryEnum = (typeof ACTIVITY_CATEGORIES)[number];

// ─── Subcategories ──────────────────────────────────────────────────────────

export const SUBCATEGORIES: Record<ActivityCategoryEnum, readonly string[]> = {
  transportation: ['car', 'bus', 'train', 'bicycle', 'walking', 'motorcycle', 'airplane'],
  electricity: ['household', 'office', 'appliance'],
  food: ['beef', 'chicken', 'fish', 'vegetables', 'dairy', 'grains'],
  water: ['household', 'garden', 'pool'],
  shopping: ['clothing', 'electronics', 'furniture'],
} as const;

// ─── Units ──────────────────────────────────────────────────────────────────

export const UNITS: Record<ActivityCategoryEnum, readonly string[]> = {
  transportation: ['km', 'miles'],
  electricity: ['kWh'],
  food: ['kg', 'lbs'],
  water: ['liters', 'gallons'],
  shopping: ['items', 'units'],
} as const;

// ─── Goal Statuses ──────────────────────────────────────────────────────────

export const GOAL_STATUSES = ['active', 'completed', 'failed'] as const;

// ─── Goal Periods ───────────────────────────────────────────────────────────

export const GOAL_PERIODS = ['weekly', 'monthly', 'yearly'] as const;

// ─── Challenge Difficulty ───────────────────────────────────────────────────

export const CHALLENGE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

// ─── Challenge Frequency ────────────────────────────────────────────────────

export const CHALLENGE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'one-time'] as const;

// ─── Challenge Progress Status ──────────────────────────────────────────────

export const CHALLENGE_PROGRESS_STATUSES = ['in-progress', 'completed', 'abandoned'] as const;

// ─── Period Types ───────────────────────────────────────────────────────────

export const PERIOD_TYPES = ['day', 'week', 'month', 'year'] as const;

// ─── Badge Definitions ──────────────────────────────────────────────────────

export interface BadgeDefinition {
  badge: string;
  title: string;
  description: string;
}

export const BADGES: Record<string, BadgeDefinition> = {
  FIRST_ACTIVITY: {
    badge: 'first_activity',
    title: 'First Step',
    description: 'Logged your very first carbon activity',
  },
  TEN_ACTIVITIES: {
    badge: 'ten_activities',
    title: 'Getting Started',
    description: 'Logged 10 carbon activities',
  },
  HUNDRED_ACTIVITIES: {
    badge: 'hundred_activities',
    title: 'Dedicated Tracker',
    description: 'Logged 100 carbon activities',
  },
  SEVEN_DAY_STREAK: {
    badge: 'seven_day_streak',
    title: 'Week Warrior',
    description: 'Logged activities for 7 consecutive days',
  },
  THIRTY_DAY_STREAK: {
    badge: 'thirty_day_streak',
    title: 'Monthly Master',
    description: 'Logged activities for 30 consecutive days',
  },
  REDUCED_10_PERCENT: {
    badge: 'reduced_10_percent',
    title: 'Carbon Cutter',
    description: 'Reduced your carbon footprint by 10%',
  },
  REDUCED_25_PERCENT: {
    badge: 'reduced_25_percent',
    title: 'Eco Champion',
    description: 'Reduced your carbon footprint by 25%',
  },
  GOAL_COMPLETED: {
    badge: 'goal_completed',
    title: 'Goal Getter',
    description: 'Completed your first carbon reduction goal',
  },
  FIVE_CHALLENGES: {
    badge: 'five_challenges',
    title: 'Challenge Accepted',
    description: 'Completed 5 eco-challenges',
  },
  ZERO_TRANSPORT_DAY: {
    badge: 'zero_transport_day',
    title: 'Car-Free Day',
    description: 'Had a day with zero transportation emissions',
  },
} as const;

// ─── Misc Constants ─────────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const BCRYPT_ROUNDS = 12;
