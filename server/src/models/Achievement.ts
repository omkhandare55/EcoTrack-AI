import mongoose, { Schema } from 'mongoose';
import type { IAchievement } from '../types';

const achievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    badge: {
      type: String,
      required: [true, 'Badge identifier is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

// A user can only earn a specific badge once
achievementSchema.index({ userId: 1, badge: 1 }, { unique: true });

const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);
export default Achievement;
