import { z } from 'zod';

/**
 * Login form validation schema.
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must include uppercase, lowercase, and a number',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Activity form validation schema.
 */
export const activitySchema = z.object({
  category: z.enum(['transportation', 'energy', 'food', 'shopping', 'waste'], {
    required_error: 'Please select a category',
  }),
  subcategory: z.string().min(1, 'Please select a subcategory'),
  value: z
    .number({ required_error: 'Value is required', invalid_type_error: 'Value must be a number' })
    .positive('Value must be greater than 0')
    .max(100000, 'Value seems too high'),
  unit: z.string().min(1, 'Unit is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500, 'Description too long').optional(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;

/**
 * Goal form validation schema.
 */
export const goalSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    category: z.enum(['all', 'transportation', 'energy', 'food', 'shopping', 'waste'], {
      required_error: 'Please select a category',
    }),
    targetReduction: z
      .number({
        required_error: 'Target reduction is required',
        invalid_type_error: 'Must be a number',
      })
      .positive('Must be greater than 0')
      .max(100, 'Cannot exceed 100%'),
    period: z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], {
      required_error: 'Please select a period',
    }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type GoalFormValues = z.infer<typeof goalSchema>;

/**
 * Validate data against a Zod schema and return structured errors.
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}

/**
 * Get password strength score (0–4) and label.
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const normalized = Math.min(score, 4);
  const labels: Record<number, { label: string; color: string }> = {
    0: { label: 'Very Weak', color: '#ef4444' },
    1: { label: 'Weak', color: '#f97316' },
    2: { label: 'Fair', color: '#f59e0b' },
    3: { label: 'Strong', color: '#22c55e' },
    4: { label: 'Very Strong', color: '#10b981' },
  };

  const info = labels[normalized] ?? labels[0]!;
  return { score: normalized, ...info };
}
