import mongoose, { Schema } from 'mongoose';
import type { IActivity } from '../types';
import { ACTIVITY_CATEGORIES } from '../utils/constants';

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: ACTIVITY_CATEGORIES,
        message: `Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`,
      },
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Value is required'],
      min: [0, 'Value cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    carbonKg: {
      type: Number,
      required: [true, 'Carbon emission value is required'],
      min: [0, 'Carbon emission cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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

// ─── Compound Indexes ───────────────────────────────────────────────────────

activitySchema.index({ userId: 1, date: -1 });
activitySchema.index({ userId: 1, category: 1 });
activitySchema.index({ userId: 1, date: -1, category: 1 });

const Activity = mongoose.model<IActivity>('Activity', activitySchema);
export default Activity;
