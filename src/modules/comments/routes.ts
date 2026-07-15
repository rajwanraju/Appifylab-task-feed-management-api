import { Router } from 'express';
import { commentController } from './controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createCommentSchema, updateCommentSchema, postIdParamSchema, commentIdSchema } from './validation';

const router = Router();

router.get('/posts/:id/comments', authenticate, validate(postIdParamSchema, 'params'), commentController.getByPostId);
router.post(
  '/posts/:id/comments',
  authenticate,
  validate(createCommentSchema),
  validate(postIdParamSchema, 'params'),
  commentController.create,
);
router.patch(
  '/comments/:id',
  authenticate,
  validate(updateCommentSchema),
  validate(commentIdSchema, 'params'),
  commentController.update,
);
router.delete('/comments/:id', authenticate, validate(commentIdSchema, 'params'), commentController.delete);

export default router;
