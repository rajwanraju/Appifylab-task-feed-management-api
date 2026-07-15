import { Router } from 'express';
import { replyController } from './controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createReplySchema, updateReplySchema, commentIdParamSchema, replyIdSchema } from './validation';

const router = Router();

router.get(
  '/comments/:id/replies',
  authenticate,
  validate(commentIdParamSchema, 'params'),
  replyController.getByCommentId,
);
router.post(
  '/comments/:id/replies',
  authenticate,
  validate(createReplySchema),
  validate(commentIdParamSchema, 'params'),
  replyController.create,
);
router.patch(
  '/replies/:id',
  authenticate,
  validate(updateReplySchema),
  validate(replyIdSchema, 'params'),
  replyController.update,
);
router.delete('/replies/:id', authenticate, validate(replyIdSchema, 'params'), replyController.delete);

export default router;
