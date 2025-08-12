import { z } from 'zod';

export const studentIdRegex = /^\d+$/;

export const studentSchema = z.object({
  studentIdNumber: z.string().regex(studentIdRegex, 'Invalid Student ID. Use digits only.'),
  firstName: z.string().min(2, 'First name must be at least 2 characters long.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long.'),
  email: z.string().email('Invalid email address.'),
  year: z.number().min(1, 'Year level is required.').max(5, 'Year level must be between 1 and 5.'),
  programId: z.string().min(1, 'Program is required.'),
});

export type StudentFormInput = z.infer<typeof studentSchema>; 