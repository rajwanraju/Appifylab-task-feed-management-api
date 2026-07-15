import { Router } from 'express';
import { LikeTarget } from '@prisma/client';
import { likeController } from './controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { targetIdSchema, toggleLikeSchema } from './validation';

const router = Router();

router.post(
  '/posts/:id/like',
  authenticate,
  validate(toggleLikeSchema),
  validate(targetIdSchema, 'params'),
  likeController.like(LikeTarget.POST),
);
router.delete(
  '/posts/:id/like',
  authenticate,
  validate(targetIdSchema, 'params'),
  likeController.unlike(LikeTarget.POST),
);
router.get(
  '/posts/:id/likes',
  authenticate,
  validate(targetIdSchema, 'params'),
  likeController.getLikes(LikeTarget.POST),
);
router.post(
  '/posts/:id/toggle-like',
  authenticate,
  validate(toggleLikeSchema),
  validate(targetIdSchema, 'params'),
  likeController.toggle(LikeTarget.POST),
);

router.post(
  '/comments/:id/like',
  authenticate,
  validate(toggleLikeSchema),
  validate(targetIdSchema, 'params'),
  likeController.like(LikeTarget.COMMENT),
);
router.delete(
  '/comments/:id/like',
  authenticate,
  validate(targetIdSchema, 'params'),
  likeController.unlike(LikeTarget.COMMENT),
);
router.get(
  '/comments/:id/likes',
  authenticate,
  validate(targetIdSchema, 'params'),
  likeController.getLikes(LikeTarget.COMMENT),
);
router.post(
  '/comments/:id/toggle-like',
  authenticate,
  validate(toggleLikeSchema),
  validate(targetIdSchema, 'params'),
  likeController.toggle(LikeTarget.COMMENT),
);

router.post(
  '/replies/:id/like',
  authenticate,
  validate(toggleLikeSchema),
  validate(targetIdSchema, 'params'),
  likeController.like(LikeTarget.REPLY),
);
router.delete(
  '/replies/:id/like',
  authenticate,
  validate(targetIdSchema, 'params'),
  likeController.unlike(LikeTarget.REPLY),
);
router.get(
  '/replies/:id/likes',
  authenticate,
  validate(targetIdSchema, 'params'),
  likeController.getLikes(LikeTarget.REPLY),
);
router.post(
  '/replies/:id/toggle-like',
  authenticate,
  validate(toggleLikeSchema),
  validate(targetIdSchema, 'params'),
  likeController.toggle(LikeTarget.REPLY),
);

export default router;
