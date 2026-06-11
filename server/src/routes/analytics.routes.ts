import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const trendsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('day'),
  rangeDays: z.coerce.number().int().positive().optional().default(30),
});

const breakdownQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

router.get('/summary', analyticsController.getSummary);
router.get('/trends', validateQuery(trendsQuerySchema), analyticsController.getTrends);
router.get('/breakdown', validateQuery(breakdownQuerySchema), analyticsController.getBreakdown);
router.get('/comparison', analyticsController.getComparison);
router.get('/predictions', analyticsController.getPredictions);

export default router;
