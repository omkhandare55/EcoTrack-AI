import { Router } from 'express';
import authRoutes from './auth.routes';
import activityRoutes from './activity.routes';
import analyticsRoutes from './analytics.routes';
import goalRoutes from './goal.routes';
import challengeRoutes from './challenge.routes';
import recommendationRoutes from './recommendation.routes';
import achievementRoutes from './achievement.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/goals', goalRoutes);
router.use('/challenges', challengeRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/achievements', achievementRoutes);

export default router;
