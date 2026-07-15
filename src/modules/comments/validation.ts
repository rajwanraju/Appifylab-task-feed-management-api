import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export const commentIdSchema = z.object({
  id: z.string().uuid('Invalid comment ID'),
});

export const postIdParamSchema = z.object({
  id: z.string().uuid('Invalid post ID'),
});
