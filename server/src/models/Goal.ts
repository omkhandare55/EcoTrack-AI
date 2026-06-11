import mongoose, { Schema } from 'mongoose';
import type { IGoal } from '../types';
import { ACTIVITY_CATEGORIES, GOAL_PERIODS, GOAL_STATUSES } from '../utils/constants';

const goalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ACTIVITY_CATEGORIES,
        message: `Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`,
      },
      required: [true, 'Category is required'],
    },
    targetReduction: {
      type: Number,
      required: [true, 'Target reduction is required'],
      min: [0, 'Target reduction must be positive'],
      max: [100, 'Target reduction cannot exceed 100%'],
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    baselineValue: {
      type: Number,
      default: 0,
    },
    period: {
      type: String,
      enum: {
        values: GOAL_PERIODS,
        message: `Period must be one of: ${GOAL_PERIODS.join(', ')}`,
      },
      required: [true, 'Period is required'],
    },
    status: {
      type: String,
      enum: {
        values: GOAL_STATUSES,
        message: `Status must be one of: ${GOAL_STATUSES.join(', ')}`,
      },
      default: 'active',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> {
        delete ret.__v;
        return ret;
      },
    },
  },
);

goalSchema.index({ userId: 1, status: 1 });

const Goal = mongoose.model<IGoal>('Goal', goalSchema);
export default Goal;
