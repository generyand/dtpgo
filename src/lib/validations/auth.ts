import { z } from 'zod';

/**
 * Email validation - reusable email schema
 */
const emailSchema = z.string()
  .email({ message: 'Please enter a valid email address.' })
  .min(1, { message: 'Email is required.' });

/**
 * Password validation - reusable password schema
 */
const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters long.' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
  });

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required.' }), // Less strict for login
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }).optional(),
  lastName: z.string().min(1, { message: 'Last name is required.' }).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Password reset request validation schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

/**
 * Password reset validation schema (for setting new password)
 */
export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

/**
 * User role validation schema
 */
export const userRoleSchema = z.enum(['admin', 'organizer'], {
  message: 'Invalid user role. Must be admin or organizer.'
});

export type UserRoleInput = z.infer<typeof userRoleSchema>;

/**
 * Change password validation schema (for authenticated users)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, { message: 'Please confirm your new password.' }),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>; 