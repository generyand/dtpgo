import { z } from 'zod';
import { prisma } from '@/lib/db/client';

/**
 * Email validation schema with comprehensive rules
 */
export const emailValidationSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .trim()
  .refine(
    (email) => {
      // Check for common email patterns
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    },
    {
      message: 'Please enter a valid email address format',
    }
  )
  .refine(
    (email) => {
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /test@test\.com/i,
        /admin@admin\.com/i,
        /user@user\.com/i,
        /example@example\.com/i,
      ];
      return !suspiciousPatterns.some(pattern => pattern.test(email));
    },
    {
      message: 'Please use a professional email address',
    }
  );

/**
 * Email uniqueness validation result interface
 */
export interface EmailUniquenessResult {
  isUnique: boolean;
  isValid: boolean;
  existingOrganizer?: {
    id: string;
    email: string;
    fullName: string | null;
    isActive: boolean;
    role: string;
    createdAt: Date;
    lastLoginAt: Date | null;
  };
  suggestions?: string[];
  error?: string;
  validationErrors?: string[];
}

/**
 * Email validation options
 */
export interface EmailValidationOptions {
  excludeOrganizerId?: string;
  checkCaseSensitivity?: boolean;
  provideSuggestions?: boolean;
  validateFormat?: boolean;
  checkDomain?: boolean;
}

/**
 * Validate email format and basic rules
 */
export function validateEmailFormat(email: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    const result = emailValidationSchema.safeParse(email);
    
    if (!result.success) {
      result.error.errors.forEach((error) => {
        errors.push(error.message);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Invalid email format'],
    };
  }
}

/**
 * Check email uniqueness in the database
 */
export async function checkEmailUniqueness(
  email: string,
  options: EmailValidationOptions = {}
): Promise<EmailUniquenessResult> {
  const {
    excludeOrganizerId,
    checkCaseSensitivity = true,
    provideSuggestions = true,
    validateFormat = true,
    checkDomain = true,
  } = options;

  try {
    // First validate email format if requested
    if (validateFormat) {
      const formatValidation = validateEmailFormat(email);
      if (!formatValidation.isValid) {
        return {
          isUnique: false,
          isValid: false,
          validationErrors: formatValidation.errors,
          error: 'Invalid email format',
        };
      }
    }

    // Normalize email for case-insensitive comparison
    const normalizedEmail = checkCaseSensitivity 
      ? email.toLowerCase().trim() 
      : email.trim();

    // Build query conditions
    const whereClause: any = {
      email: normalizedEmail,
    };

    // Exclude current organizer when updating
    if (excludeOrganizerId) {
      whereClause.id = { not: excludeOrganizerId };
    }

    // Check for existing organizer
    const existingOrganizer = await prisma.organizer.findFirst({
      where: whereClause,
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (existingOrganizer) {
      const suggestions = provideSuggestions 
        ? await generateEmailSuggestions(normalizedEmail, excludeOrganizerId)
        : [];

      return {
        isUnique: false,
        isValid: true,
        existingOrganizer,
        suggestions,
        error: 'Email address is already in use',
      };
    }

    // Additional domain validation if requested
    if (checkDomain) {
      const domainValidation = await validateEmailDomain(normalizedEmail);
      if (!domainValidation.isValid) {
        return {
          isUnique: true,
          isValid: false,
          validationErrors: domainValidation.errors,
          error: 'Email domain validation failed',
        };
      }
    }

    return {
      isUnique: true,
      isValid: true,
    };
  } catch (error) {
    console.error('Error checking email uniqueness:', error);
    return {
      isUnique: false,
      isValid: false,
      error: 'Error validating email uniqueness',
    };
  }
}

/**
 * Generate email suggestions for similar emails
 */
async function generateEmailSuggestions(
  email: string,
  excludeOrganizerId?: string
): Promise<string[]> {
  try {
    const [localPart, domain] = email.split('@');
    const suggestions: string[] = [];

    // Generate variations of the local part
    const variations = [
      `${localPart}1`,
      `${localPart}2`,
      `${localPart}.admin`,
      `${localPart}.org`,
      `admin.${localPart}`,
    ];

    // Check which variations are available
    for (const variation of variations) {
      const testEmail = `${variation}@${domain}`;
      
      const whereClause: any = {
        email: testEmail.toLowerCase(),
      };

      if (excludeOrganizerId) {
        whereClause.id = { not: excludeOrganizerId };
      }

      const exists = await prisma.organizer.findFirst({
        where: whereClause,
        select: { id: true },
      });

      if (!exists) {
        suggestions.push(testEmail);
      }
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  } catch (error) {
    console.error('Error generating email suggestions:', error);
    return [];
  }
}

/**
 * Validate email domain (basic domain validation)
 */
async function validateEmailDomain(email: string): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  const [, domain] = email.split('@');

  if (!domain) {
    errors.push('Invalid email domain');
    return { isValid: false, errors };
  }

  // Check for common invalid domains
  const invalidDomains = [
    'localhost',
    'example.com',
    'test.com',
    'invalid.com',
    'temp.com',
  ];

  if (invalidDomains.includes(domain.toLowerCase())) {
    errors.push('Please use a valid email domain');
  }

  // Check domain format
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    errors.push('Invalid domain format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Real-time email validation for forms
 */
export async function validateEmailRealtime(
  email: string,
  options: EmailValidationOptions = {}
): Promise<{
  isValid: boolean;
  isUnique: boolean;
  message?: string;
  suggestions?: string[];
  severity: 'error' | 'warning' | 'success';
}> {
  try {
    const result = await checkEmailUniqueness(email, options);

    if (!result.isValid) {
      return {
        isValid: false,
        isUnique: false,
        message: result.validationErrors?.[0] || result.error || 'Invalid email',
        severity: 'error',
      };
    }

    if (!result.isUnique) {
      return {
        isValid: true,
        isUnique: false,
        message: 'Email address is already in use',
        suggestions: result.suggestions,
        severity: 'error',
      };
    }

    return {
      isValid: true,
      isUnique: true,
      message: 'Email address is available',
      severity: 'success',
    };
  } catch (error) {
    console.error('Error in real-time email validation:', error);
    return {
      isValid: false,
      isUnique: false,
      message: 'Error validating email',
      severity: 'error',
    };
  }
}

/**
 * Bulk email validation for multiple emails
 */
export async function validateBulkEmails(
  emails: string[],
  options: EmailValidationOptions = {}
): Promise<{
  validEmails: string[];
  invalidEmails: Array<{
    email: string;
    errors: string[];
  }>;
  duplicateEmails: Array<{
    email: string;
    existingOrganizer: EmailUniquenessResult['existingOrganizer'];
  }>;
}> {
  const validEmails: string[] = [];
  const invalidEmails: Array<{
    email: string;
    errors: string[];
  }> = [];
  const duplicateEmails: Array<{
    email: string;
    existingOrganizer: EmailUniquenessResult['existingOrganizer'];
  }> = [];

  for (const email of emails) {
    const result = await checkEmailUniqueness(email, options);

    if (!result.isValid) {
      invalidEmails.push({
        email,
        errors: result.validationErrors || [result.error || 'Invalid email'],
      });
    } else if (!result.isUnique) {
      duplicateEmails.push({
        email,
        existingOrganizer: result.existingOrganizer!,
      });
    } else {
      validEmails.push(email);
    }
  }

  return {
    validEmails,
    invalidEmails,
    duplicateEmails,
  };
}

/**
 * Email validation middleware for API routes
 */
export function createEmailValidationMiddleware(options: EmailValidationOptions = {}) {
  return async (req: any, res: any, next: any) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email is required',
          field: 'email',
        });
      }

      const validation = await checkEmailUniqueness(email, options);

      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Invalid email format',
          details: validation.validationErrors,
          field: 'email',
        });
      }

      if (!validation.isUnique) {
        return res.status(409).json({
          error: 'Email address is already in use',
          existingOrganizer: validation.existingOrganizer,
          suggestions: validation.suggestions,
          field: 'email',
        });
      }

      // Add validation result to request for use in route handler
      req.emailValidation = validation;
      next();
    } catch (error) {
      console.error('Email validation middleware error:', error);
      res.status(500).json({
        error: 'Email validation failed',
      });
    }
  };
}

/**
 * Email uniqueness check with caching (for performance)
 */
const emailCache = new Map<string, { result: EmailUniquenessResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function checkEmailUniquenessWithCache(
  email: string,
  options: EmailValidationOptions = {}
): Promise<EmailUniquenessResult> {
  const cacheKey = `${email}-${options.excludeOrganizerId || 'new'}`;
  const cached = emailCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const result = await checkEmailUniqueness(email, options);
  
  emailCache.set(cacheKey, {
    result,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Clear email validation cache
 */
export function clearEmailValidationCache(email?: string): void {
  if (email) {
    // Clear specific email cache entries
    for (const key of emailCache.keys()) {
      if (key.startsWith(email)) {
        emailCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    emailCache.clear();
  }
}

/**
 * Email validation error messages
 */
export const emailValidationMessages = {
  REQUIRED: 'Email is required',
  INVALID_FORMAT: 'Please enter a valid email address',
  TOO_SHORT: 'Email must be at least 5 characters',
  TOO_LONG: 'Email must be less than 255 characters',
  NOT_UNIQUE: 'Email address is already in use',
  SUSPICIOUS_PATTERN: 'Please use a professional email address',
  INVALID_DOMAIN: 'Please use a valid email domain',
  VALIDATION_ERROR: 'Error validating email',
  CACHE_ERROR: 'Error accessing email validation cache',
} as const;

/**
 * Email validation statistics
 */
export async function getEmailValidationStats(): Promise<{
  totalEmails: number;
  uniqueEmails: number;
  duplicateEmails: number;
  invalidEmails: number;
  domainStats: Array<{
    domain: string;
    count: number;
  }>;
}> {
  try {
    const organizers = await prisma.organizer.findMany({
      select: {
        email: true,
        isActive: true,
      },
    });

    const totalEmails = organizers.length;
    const uniqueEmails = new Set(organizers.map(o => o.email.toLowerCase())).size;
    const duplicateEmails = totalEmails - uniqueEmails;

    // Domain statistics
    const domainCounts = new Map<string, number>();
    organizers.forEach(org => {
      const domain = org.email.split('@')[1]?.toLowerCase();
      if (domain) {
        domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      }
    });

    const domainStats = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 domains

    return {
      totalEmails,
      uniqueEmails,
      duplicateEmails,
      invalidEmails: 0, // Would need additional validation to determine
      domainStats,
    };
  } catch (error) {
    console.error('Error getting email validation stats:', error);
    throw new Error('Failed to get email validation statistics');
  }
}
