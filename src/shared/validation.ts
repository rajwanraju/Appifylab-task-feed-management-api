import { z } from 'zod';

export const objectIdSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});
