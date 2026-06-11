import { z } from 'zod';

/**
 * Validates that a string is a valid MongoDB ObjectId (24-char hex).
 */
export const objectIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * Reusable pagination query params.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Reusable date range query params.
 */
export const dateRangeSchema = z
  .object({
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

export type ObjectIdInput = z.infer<typeof objectIdSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
