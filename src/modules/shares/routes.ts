import { Router } from 'express';
import { shareController } from './controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { shareTargetSchema } from './validation';

const router = Router();

router.post('/posts/:id/share', authenticate, validate(shareTargetSchema, 'params'), shareController.share);
router.delete('/posts/:id/share', authenticate, validate(shareTargetSchema, 'params'), shareController.unshare);
router.get('/posts/:id/shares', authenticate, validate(shareTargetSchema, 'params'), shareController.getShares);
router.post('/posts/:id/toggle-share', authenticate, validate(shareTargetSchema, 'params'), shareController.toggle);

export default router;
