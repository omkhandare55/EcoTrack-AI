import { z } from 'zod';
import { ACTIVITY_CATEGORIES } from '../utils/constants';

export const createActivitySchema = z.object({
  category: z.enum(ACTIVITY_CATEGORIES, {
    errorMap: () => ({
      message: `Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`,
    }),
  }),
  subcategory: z
    .string({ required_error: 'Subcategory is required' })
    .trim()
    .min(1, 'Subcategory is required'),
  value: z
    .number({ required_error: 'Value is required' })
    .positive('Value must be a positive number'),
  unit: z.string({ required_error: 'Unit is required' }).trim().min(1, 'Unit is required'),
  date: z.string().datetime({ message: 'Date must be a valid ISO 8601 string' }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const queryActivitiesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.enum(ACTIVITY_CATEGORIES).optional(),
  startDate: z
    .string()
    .datetime({ message: 'startDate must be a valid ISO 8601 string' })
    .optional(),
  endDate: z.string().datetime({ message: 'endDate must be a valid ISO 8601 string' }).optional(),
  sort: z.string().optional().default('-date'),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type QueryActivitiesInput = z.infer<typeof queryActivitiesSchema>;
