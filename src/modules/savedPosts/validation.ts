import { z } from 'zod';

export const savedPostTargetSchema = z.object({
  id: z.string().uuid('Invalid post ID'),
});
