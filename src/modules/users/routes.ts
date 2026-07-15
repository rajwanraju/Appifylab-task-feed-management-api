import { Router } from 'express';
import { userController } from './controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { updateUserSchema } from './validation';

const router = Router();

router.get('/me', authenticate, userController.getProfile);
router.patch('/me', authenticate, validate(updateUserSchema), userController.updateProfile);

export default router;
