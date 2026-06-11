import { Router } from 'express';
import * as challengeController from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth';
import { validateParams } from '../middleware/validate';
import { objectIdSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

router.get('/', challengeController.getAll);
router.get('/progress', challengeController.getProgress);
router.post('/:id/complete', validateParams(objectIdSchema), challengeController.complete);
router.get('/leaderboard', challengeController.getLeaderboard);

export default router;
