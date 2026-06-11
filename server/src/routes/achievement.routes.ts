import { Router } from 'express';
import * as achievementController from '../controllers/achievement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', achievementController.getAchievements);

export default router;
