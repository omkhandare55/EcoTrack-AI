import { Router } from 'express';
import * as goalController from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth';
import { validate, validateParams } from '../middleware/validate';
import { createGoalSchema, updateGoalSchema } from '../validators/goal.validator';
import { objectIdSchema } from '../validators/common.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createGoalSchema), goalController.create);
router.get('/', goalController.getAll);
router.patch(
  '/:id',
  validateParams(objectIdSchema),
  validate(updateGoalSchema),
  goalController.update,
);
router.delete('/:id', validateParams(objectIdSchema), goalController.deleteGoal);

export default router;
