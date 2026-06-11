import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validate';
import { createActivitySchema, queryActivitiesSchema } from '../validators/activity.validator';
import { objectIdSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createActivitySchema), activityController.create);
router.get('/', validateQuery(queryActivitiesSchema), activityController.getAll);
router.get('/:id', validateParams(objectIdSchema), activityController.getById);
router.delete('/:id', validateParams(objectIdSchema), activityController.deleteActivity);

export default router;
