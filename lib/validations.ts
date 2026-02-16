import { z } from 'zod'

export const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['manager', 'worker', 'router', 'monitor'], {
    errorMap: () => ({ message: 'Invalid role. Must be manager, worker, router, or monitor' }),
  }),
  departmentId: z.string().optional().nullable(),
  model: z.enum(['opus', 'sonnet', 'haiku']).default('sonnet'),
  config: z.any().default({}),
})

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  departmentId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  createdById: z.string().optional().nullable(),
  priority: z.enum(['critical', 'high', 'normal', 'low', 'background']).default('normal'),
  payload: z.any().default({}),
  parentTaskId: z.string().optional().nullable(),
})

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
})

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(200),
})

export function formatZodError(error: z.ZodError): string {
  return error.issues.map(i => i.message).join(', ')
}
