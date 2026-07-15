import { z } from 'zod';
import { LikeTarget, ReactionType } from '@prisma/client';

export const targetIdSchema = z.object({
  id: z.string().uuid('Invalid target ID'),
});

export const likeTargetSchema = z.object({
  targetType: z.nativeEnum(LikeTarget),
  targetId: z.string().uuid('Invalid target ID'),
});

export const toggleLikeSchema = z.object({
  reactionType: z.nativeEnum(ReactionType).optional(),
});
