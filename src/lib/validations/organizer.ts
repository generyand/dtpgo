import { z } from 'zod';
import { prisma } from '@/lib/db/client';

/**
 * Organizer role enum validation
 */
export const organizerRoleSchema = z.enum(['organizer', 'admin'], {
  required_error: 'Please select a role',
  invalid_type_error: 'Role must be either "organizer" or "admin"',
});

/**
 * Base organizer validation schema for creation
 */
export const organizerCreateSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .trim(),
  role: organizerRoleSchema,
  isActive: z.boolean().default(true),
  invitedBy: z.string().cuid('Invalid invited by user ID format').optional(),
});

/**
 * Organizer update validation schema
 */
export const organizerUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .trim()
    .optional(),
  role: organizerRoleSchema.optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { 
    message: 'At least one field must be provided for update',
    path: ['root']
  }
);

/**
 * Organizer status update schema
 */
export const organizerStatusUpdateSchema = z.object({
  isActive: z.boolean({
    required_error: 'Status is required',
    invalid_type_error: 'Status must be a boolean value',
  }),
  reason: z
    .string()
    .min(1, 'Reason is required for status changes')
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
});

/**
 * Organizer role update schema
 */
export const organizerRoleUpdateSchema = z.object({
  role: organizerRoleSchema,
  reason: z
    .string()
    .min(1, 'Reason is required for role changes')
    .max(500, 'Reason must be less than 500 characters')
    .optional(),
});

/**
 * Organizer profile update schema (for self-updates)
 */
export const organizerProfileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .trim(),
});

/**
 * Organizer search/filter validation schema
 */
export const organizerSearchSchema = z.object({
  query: z.string().max(100, 'Search query too long').optional(),
  role: organizerRoleSchema.optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'createdAt', 'lastLoginAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Organizer bulk operations schema
 */
export const organizerBulkOperationSchema = z.object({
  organizerIds: z
    .array(z.string().cuid('Invalid organizer ID format'))
    .min(1, 'At least one organizer ID is required')
    .max(50, 'Cannot process more than 50 organizers at once'),
  operation: z.enum(['activate', 'deactivate', 'delete', 'export']),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

/**
 * TypeScript types derived from schemas
 */
export type OrganizerCreateInput = z.infer<typeof organizerCreateSchema>;
export type OrganizerUpdateInput = z.infer<typeof organizerUpdateSchema>;
export type OrganizerStatusUpdateInput = z.infer<typeof organizerStatusUpdateSchema>;
export type OrganizerRoleUpdateInput = z.infer<typeof organizerRoleUpdateSchema>;
export type OrganizerProfileUpdateInput = z.infer<typeof organizerProfileUpdateSchema>;
export type OrganizerSearchInput = z.infer<typeof organizerSearchSchema>;
export type OrganizerBulkOperationInput = z.infer<typeof organizerBulkOperationSchema>;

/**
 * Email uniqueness validation result
 */
export interface EmailUniquenessResult {
  isUnique: boolean;
  existingOrganizer?: {
    id: string;
    email: string;
    fullName: string | null;
    isActive: boolean;
  };
  error?: string;
}

/**
 * Validate email uniqueness for organizer creation/update
 */
export async function validateEmailUniqueness(
  email: string,
  excludeOrganizerId?: string
): Promise<EmailUniquenessResult> {
  try {
    const whereClause: any = {
      email: email.toLowerCase().trim(),
    };

    // Exclude current organizer when updating
    if (excludeOrganizerId) {
      whereClause.id = { not: excludeOrganizerId };
    }

    const existingOrganizer = await prisma.organizer.findFirst({
      where: whereClause,
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    if (existingOrganizer) {
      return {
        isUnique: false,
        existingOrganizer,
        error: 'Email address is already in use',
      };
    }

    return { isUnique: true };
  } catch (error) {
    console.error('Error validating email uniqueness:', error);
    return {
      isUnique: false,
      error: 'Error validating email uniqueness',
    };
  }
}

/**
 * Organizer validation result interface
 */
export interface OrganizerValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Comprehensive organizer validation function
 */
export async function validateOrganizer(
  data: OrganizerCreateInput | OrganizerUpdateInput,
  options: {
    checkEmailUniqueness?: boolean;
    excludeOrganizerId?: string;
    validateBusinessRules?: boolean;
  } = {}
): Promise<OrganizerValidationResult> {
  const {
    checkEmailUniqueness = true,
    excludeOrganizerId,
    validateBusinessRules = true,
  } = options;

  const errors: OrganizerValidationResult['errors'] = [];
  const warnings: OrganizerValidationResult['warnings'] = [];

  try {
    // Validate schema first
    const schema = 'email' in data ? organizerCreateSchema : organizerUpdateSchema;
    const validationResult = schema.safeParse(data);

    if (!validationResult.success) {
      validationResult.error.errors.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          code: error.code,
        });
      });
    }

    // Check email uniqueness if email is provided
    if (checkEmailUniqueness && 'email' in data && data.email) {
      const emailResult = await validateEmailUniqueness(data.email, excludeOrganizerId);
      if (!emailResult.isUnique) {
        errors.push({
          field: 'email',
          message: emailResult.error || 'Email address is already in use',
          code: 'EMAIL_NOT_UNIQUE',
        });
      }
    }

    // Business rule validations
    if (validateBusinessRules) {
      // Check if trying to deactivate the last admin
      if ('isActive' in data && data.isActive === false && 'role' in data) {
        const adminCount = await prisma.organizer.count({
          where: {
            role: 'admin',
            isActive: true,
            ...(excludeOrganizerId ? { id: { not: excludeOrganizerId } } : {}),
          },
        });

        if (adminCount === 0) {
          errors.push({
            field: 'isActive',
            message: 'Cannot deactivate the last active admin',
            code: 'LAST_ADMIN_DEACTIVATION',
          });
        }
      }

      // Check role change restrictions
      if ('role' in data && excludeOrganizerId) {
        const currentOrganizer = await prisma.organizer.findUnique({
          where: { id: excludeOrganizerId },
          select: { role: true, isActive: true },
        });

        if (currentOrganizer?.role === 'admin' && data.role === 'organizer') {
          const adminCount = await prisma.organizer.count({
            where: {
              role: 'admin',
              isActive: true,
              id: { not: excludeOrganizerId },
            },
          });

          if (adminCount === 0) {
            errors.push({
              field: 'role',
              message: 'Cannot change role from admin to organizer - no other admins exist',
              code: 'LAST_ADMIN_ROLE_CHANGE',
            });
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error('Error validating organizer:', error);
    return {
      isValid: false,
      errors: [
        {
          field: 'root',
          message: 'Validation error occurred',
          code: 'VALIDATION_ERROR',
        },
      ],
    };
  }
}

/**
 * Validate organizer search parameters
 */
export function validateOrganizerSearch(data: unknown): OrganizerValidationResult {
  const errors: OrganizerValidationResult['errors'] = [];

  try {
    const validationResult = organizerSearchSchema.safeParse(data);

    if (!validationResult.success) {
      validationResult.error.errors.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          code: error.code,
        });
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error('Error validating organizer search:', error);
    return {
      isValid: false,
      errors: [
        {
          field: 'root',
          message: 'Search validation error occurred',
          code: 'SEARCH_VALIDATION_ERROR',
        },
      ],
    };
  }
}

/**
 * Validate bulk organizer operations
 */
export async function validateBulkOrganizerOperation(
  data: OrganizerBulkOperationInput
): Promise<OrganizerValidationResult> {
  const errors: OrganizerValidationResult['errors'] = [];

  try {
    // Validate schema first
    const validationResult = organizerBulkOperationSchema.safeParse(data);

    if (!validationResult.success) {
      validationResult.error.errors.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          code: error.code,
        });
      });
    }

    // Check if organizers exist
    const existingOrganizers = await prisma.organizer.findMany({
      where: { id: { in: data.organizerIds } },
      select: { id: true, email: true, role: true, isActive: true },
    });

    const existingIds = existingOrganizers.map(o => o.id);
    const nonExistentIds = data.organizerIds.filter(id => !existingIds.includes(id));

    if (nonExistentIds.length > 0) {
      errors.push({
        field: 'organizerIds',
        message: `${nonExistentIds.length} organizer(s) not found`,
        code: 'ORGANIZERS_NOT_FOUND',
      });
    }

    // Business rule validations for bulk operations
    if (data.operation === 'deactivate' || data.operation === 'delete') {
      const adminOrganizers = existingOrganizers.filter(o => o.role === 'admin' && o.isActive);
      
      if (adminOrganizers.length > 0) {
        const remainingAdminCount = await prisma.organizer.count({
          where: {
            role: 'admin',
            isActive: true,
            id: { notIn: data.organizerIds },
          },
        });

        if (remainingAdminCount === 0) {
          errors.push({
            field: 'operation',
            message: 'Cannot deactivate/delete all admin organizers',
            code: 'ALL_ADMINS_DISABLED',
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error('Error validating bulk organizer operation:', error);
    return {
      isValid: false,
      errors: [
        {
          field: 'root',
          message: 'Bulk operation validation error occurred',
          code: 'BULK_VALIDATION_ERROR',
        },
      ],
    };
  }
}

/**
 * Custom validation error messages
 */
export const organizerValidationMessages = {
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_NOT_UNIQUE: 'Email address is already in use',
  FULL_NAME_REQUIRED: 'Full name is required',
  FULL_NAME_INVALID: 'Full name can only contain letters and spaces',
  FULL_NAME_TOO_SHORT: 'Full name must be at least 2 characters',
  FULL_NAME_TOO_LONG: 'Full name must be less than 100 characters',
  ROLE_REQUIRED: 'Please select a role',
  ROLE_INVALID: 'Role must be either "organizer" or "admin"',
  STATUS_REQUIRED: 'Status is required',
  STATUS_INVALID: 'Status must be a boolean value',
  LAST_ADMIN_DEACTIVATION: 'Cannot deactivate the last active admin',
  LAST_ADMIN_ROLE_CHANGE: 'Cannot change role from admin to organizer - no other admins exist',
  ALL_ADMINS_DISABLED: 'Cannot deactivate/delete all admin organizers',
  ORGANIZERS_NOT_FOUND: 'One or more organizers not found',
  VALIDATION_ERROR: 'Validation error occurred',
  EMAIL_UNIQUENESS_ERROR: 'Error validating email uniqueness',
} as const;

/**
 * Generate human-readable validation error summary
 */
export function generateValidationErrorSummary(errors: OrganizerValidationResult['errors']): string[] {
  return errors.map(error => `${error.field}: ${error.message}`);
}

/**
 * Sanitize organizer input data
 */
export function sanitizeOrganizerInput(data: any): any {
  const sanitized = { ...data };

  // Sanitize email
  if (sanitized.email) {
    sanitized.email = sanitized.email.toLowerCase().trim();
  }

  // Sanitize full name
  if (sanitized.fullName) {
    sanitized.fullName = sanitized.fullName.trim();
  }

  // Sanitize reason
  if (sanitized.reason) {
    sanitized.reason = sanitized.reason.trim();
  }

  return sanitized;
}
