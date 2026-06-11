import { z } from 'zod';
import { ACTIVITY_CATEGORIES, GOAL_PERIODS } from '../utils/constants';

export const createGoalSchema = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(2, 'Title must be at least 2 characters')
      .max(100, 'Title must be at most 100 characters'),
    category: z.enum(ACTIVITY_CATEGORIES, {
      errorMap: () => ({
        message: `Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`,
      }),
    }),
    targetReduction: z
      .number({ required_error: 'Target reduction is required' })
      .positive('Target reduction must be a positive number')
      .max(100, 'Target reduction cannot exceed 100%'),
    period: z.enum(GOAL_PERIODS, {
      errorMap: () => ({
        message: `Period must be one of: ${GOAL_PERIODS.join(', ')}`,
      }),
    }),
    startDate: z
      .string()
      .datetime({ message: 'startDate must be a valid ISO 8601 string' })
      .optional(),
    endDate: z.string().datetime({ message: 'endDate must be a valid ISO 8601 string' }).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    { message: 'endDate must be after startDate', path: ['endDate'] },
  );

export const updateGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be at most 100 characters')
    .optional(),
  category: z.enum(ACTIVITY_CATEGORIES).optional(),
  targetReduction: z
    .number()
    .positive('Target reduction must be a positive number')
    .max(100, 'Target reduction cannot exceed 100%')
    .optional(),
  period: z.enum(GOAL_PERIODS).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
