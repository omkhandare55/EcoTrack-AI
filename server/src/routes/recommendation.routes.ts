import { Router } from 'express';
import * as recommendationController from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', recommendationController.getRecommendations);

export default router;
