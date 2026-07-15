import { z } from 'zod';

export const createReplySchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export const updateReplySchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export const replyIdSchema = z.object({
  id: z.string().uuid('Invalid reply ID'),
});

export const commentIdParamSchema = z.object({
  id: z.string().uuid('Invalid comment ID'),
});
