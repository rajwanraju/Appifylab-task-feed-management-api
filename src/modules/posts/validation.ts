import { z } from 'zod';
import { Visibility } from '@prisma/client';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000),
  visibility: z.nativeEnum(Visibility).optional().default(Visibility.PUBLIC),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
});

export const postIdSchema = z.object({
  id: z.string().uuid('Invalid post ID'),
});

export const feedQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});
