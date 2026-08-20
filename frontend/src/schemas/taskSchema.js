import * as z from 'zod';

// Mirrors the backend's taskRules in validators.js.
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z.string().max(2000, 'Description must be 2000 characters or fewer').optional(),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  // Empty string from a cleared date input is normalized to undefined so
  // it's omitted from the request rather than sent as "".
  dueDate: z
    .string()
    .optional()
    .transform((val) => (val ? val : undefined)),
});
