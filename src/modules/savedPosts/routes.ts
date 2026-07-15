import { Router } from 'express';
import { savedPostController } from './controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { savedPostTargetSchema } from './validation';

const router = Router();

router.post('/posts/:id/save', authenticate, validate(savedPostTargetSchema, 'params'), savedPostController.save);
router.delete('/posts/:id/save', authenticate, validate(savedPostTargetSchema, 'params'), savedPostController.unsave);
router.get('/saved-posts', authenticate, savedPostController.getSaved);
router.post(
  '/posts/:id/toggle-save',
  authenticate,
  validate(savedPostTargetSchema, 'params'),
  savedPostController.toggle,
);

export default router;
