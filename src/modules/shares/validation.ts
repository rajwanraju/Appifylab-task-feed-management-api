import { z } from 'zod';

export const shareTargetSchema = z.object({
  id: z.string().uuid('Invalid post ID'),
});
