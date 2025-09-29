import { z } from 'zod'

export const organizerAcceptSchema = z.object({
  token: z.string().min(1, 'Missing token'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type OrganizerAcceptInput = z.infer<typeof organizerAcceptSchema>


