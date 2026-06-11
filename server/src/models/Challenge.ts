import mongoose, { Schema } from 'mongoose';
import type { IChallenge, IChallengeProgress } from '../types';
import {
  ACTIVITY_CATEGORIES,
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_FREQUENCIES,
  CHALLENGE_PROGRESS_STATUSES,
} from '../utils/constants';

// ─── Challenge Schema ───────────────────────────────────────────────────────

const challengeSchema = new Schema<IChallenge>(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Challenge description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ACTIVITY_CATEGORIES,
        message: `Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`,
      },
      required: [true, 'Category is required'],
    },
    difficulty: {
      type: String,
      enum: {
        values: CHALLENGE_DIFFICULTIES,
        message: `Difficulty must be one of: ${CHALLENGE_DIFFICULTIES.join(', ')}`,
      },
      required: [true, 'Difficulty is required'],
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
      min: [0, 'Points must be positive'],
    },
    estimatedSavingKg: {
      type: Number,
      required: [true, 'Estimated saving is required'],
      min: [0, 'Estimated saving must be positive'],
    },
    frequency: {
      type: String,
      enum: {
        values: CHALLENGE_FREQUENCIES,
        message: `Frequency must be one of: ${CHALLENGE_FREQUENCIES.join(', ')}`,
      },
      required: [true, 'Frequency is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

challengeSchema.index({ isActive: 1 });

// ─── Challenge Progress Schema ──────────────────────────────────────────────

const challengeProgressSchema = new Schema<IChallengeProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: CHALLENGE_PROGRESS_STATUSES,
        message: `Status must be one of: ${CHALLENGE_PROGRESS_STATUSES.join(', ')}`,
      },
      default: 'in-progress',
    },
    streak: {
      type: Number,
      default: 0,
    },
    completedDates: {
      type: [Date],
      default: [],
    },
    lastCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

challengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);
export const ChallengeProgress = mongoose.model<IChallengeProgress>(
  'ChallengeProgress',
  challengeProgressSchema,
);
