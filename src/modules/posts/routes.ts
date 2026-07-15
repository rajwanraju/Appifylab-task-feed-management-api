import { Router } from 'express';
import { postController } from './controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { createPostSchema, updatePostSchema, postIdSchema } from './validation';

const router = Router();

router.get('/', authenticate, postController.getFeed);
router.post('/', authenticate, upload.single('image'), validate(createPostSchema), postController.create);
router.get('/:id', authenticate, validate(postIdSchema, 'params'), postController.getById);
router.patch(
  '/:id',
  authenticate,
  upload.single('image'),
  validate(updatePostSchema),
  validate(postIdSchema, 'params'),
  postController.update,
);
router.delete('/:id', authenticate, validate(postIdSchema, 'params'), postController.delete);

export default router;
