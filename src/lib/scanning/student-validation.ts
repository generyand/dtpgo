import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { StudentValidationResult, ScanningStudent } from '@/lib/types/scanning';

/**
 * Student ID format validation schema
 * Format: S000-0000-000 (S followed by 3 digits, dash, 4 digits, dash, 3 digits)
 */
export const studentIdSchema = z.string()
  .regex(/^S\d{3}-\d{4}-\d{3}$/, 'Student ID must be in format S000-0000-000')
  .min(13, 'Student ID must be exactly 13 characters')
  .max(13, 'Student ID must be exactly 13 characters');

/**
 * Student validation configuration
 */
export interface StudentValidationConfig {
  /** Allow inactive students */
  allowInactiveStudents: boolean;
  /** Require student to be enrolled in current academic year */
  requireCurrentEnrollment: boolean;
  /** Maximum number of validation attempts */
  maxValidationAttempts: number;
  /** Cache validation results for this duration (in minutes) */
  cacheDuration: number;
}

/**
 * Default student validation configuration
 */
export const DEFAULT_STUDENT_VALIDATION_CONFIG: StudentValidationConfig = {
  allowInactiveStudents: false,
  requireCurrentEnrollment: true,
  maxValidationAttempts: 3,
  cacheDuration: 5, // 5 minutes
};

/**
 * Validation cache to store recent validation results
 */
const validationCache = new Map<string, {
  result: StudentValidationResult;
  timestamp: number;
}>();

/**
 * Validate student ID format
 */
export function validateStudentIdFormat(studentId: string): {
  isValid: boolean;
  error?: string;
  normalizedId?: string;
} {
  try {
    // Normalize the input (remove spaces, convert to uppercase)
    const normalizedId = studentId.trim().toUpperCase();
    
    // Validate format
    const validationResult = studentIdSchema.safeParse(normalizedId);
    
    if (!validationResult.success) {
      return {
        isValid: false,
        error: validationResult.error.issues[0]?.message || 'Invalid student ID format',
      };
    }

    return {
      isValid: true,
      normalizedId,
    };

  } catch (error) {
    console.error('Error validating student ID format:', error);
    return {
      isValid: false,
      error: 'Error occurred while validating student ID format',
    };
  }
}

/**
 * Validate student ID format with detailed error messages
 */
export function validateStudentIdFormatDetailed(studentId: string): {
  isValid: boolean;
  errors: string[];
  normalizedId?: string;
} {
  const errors: string[] = [];
  
  try {
    // Normalize the input
    const normalizedId = studentId.trim().toUpperCase();
    
    // Check length
    if (normalizedId.length !== 13) {
      errors.push('Student ID must be exactly 13 characters long');
    }
    
    // Check format
    if (!/^S\d{3}-\d{4}-\d{3}$/.test(normalizedId)) {
      errors.push('Student ID must be in format S000-0000-000 (S followed by 3 digits, dash, 4 digits, dash, 3 digits)');
    }
    
    // Check if starts with S
    if (!normalizedId.startsWith('S')) {
      errors.push('Student ID must start with the letter S');
    }
    
    // Check digit positions
    const parts = normalizedId.split('-');
    if (parts.length !== 3) {
      errors.push('Student ID must have exactly 2 dashes separating the parts');
    } else {
      if (parts[0].length !== 4 || !/^S\d{3}$/.test(parts[0])) {
        errors.push('First part must be S followed by 3 digits');
      }
      if (parts[1].length !== 4 || !/^\d{4}$/.test(parts[1])) {
        errors.push('Second part must be 4 digits');
      }
      if (parts[2].length !== 3 || !/^\d{3}$/.test(parts[2])) {
        errors.push('Third part must be 3 digits');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedId: errors.length === 0 ? normalizedId : undefined,
    };

  } catch (error) {
    console.error('Error validating student ID format:', error);
    return {
      isValid: false,
      errors: ['Error occurred while validating student ID format'],
    };
  }
}

/**
 * Validate student exists in database
 */
export async function validateStudentExists(
  studentId: string,
  config: StudentValidationConfig = DEFAULT_STUDENT_VALIDATION_CONFIG
): Promise<StudentValidationResult> {
  try {
    // Check cache first
    const cacheKey = `student_${studentId}`;
    const cached = validationCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < (config.cacheDuration * 60 * 1000)) {
      return cached.result;
    }

    // Validate format first
    const formatValidation = validateStudentIdFormat(studentId);
    if (!formatValidation.isValid) {
      const result: StudentValidationResult = {
        isValid: false,
        error: formatValidation.error,
      };
      
      // Cache the result
      validationCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });
      
      return result;
    }

    // Query database
    const student = await prisma.student.findUnique({
      where: { studentIdNumber: formatValidation.normalizedId! },
      include: {
        program: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
    });

    if (!student) {
      const result: StudentValidationResult = {
        isValid: false,
        error: 'Student not found in the system',
      };
      
      // Cache the result
      validationCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });
      
      return result;
    }

    // Check if student is active (if required)
    if (!config.allowInactiveStudents) {
      // Note: The current schema doesn't have an isActive field for students
      // This is a placeholder for future implementation
      // For now, we assume all students in the database are active
    }

    // Check current enrollment (if required)
    if (config.requireCurrentEnrollment) {
      // Note: The current schema doesn't have enrollment status
      // This is a placeholder for future implementation
      // For now, we assume all students in the database are currently enrolled
    }

    const result: StudentValidationResult = {
      isValid: true,
      student: {
        id: student.id,
        studentId: student.studentIdNumber,
        fullName: `${student.firstName} ${student.lastName}`,
        email: student.email,
        program: student.program.name,
        year: student.year,
        isActive: true, // Placeholder - assume active
      },
    };

    // Cache the result
    validationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });

    return result;

  } catch (error) {
    console.error('Error validating student exists:', error);
    
    const result: StudentValidationResult = {
      isValid: false,
      error: 'Error occurred while validating student. Please try again.',
    };
    
    return result;
  }
}

/**
 * Validate student with comprehensive checks
 */
export async function validateStudentComprehensive(
  studentId: string,
  config: StudentValidationConfig = DEFAULT_STUDENT_VALIDATION_CONFIG
): Promise<StudentValidationResult> {
  try {
    // Step 1: Format validation
    const formatValidation = validateStudentIdFormatDetailed(studentId);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        error: formatValidation.errors.join(', '),
      };
    }

    // Step 2: Database validation
    const dbValidation = await validateStudentExists(formatValidation.normalizedId!, config);
    if (!dbValidation.isValid) {
      return dbValidation;
    }

    // Step 3: Additional business logic validation
    const student = dbValidation.student!;
    
    // Check if student has valid program
    if (!student.program) {
      return {
        isValid: false,
        error: 'Student program information is missing',
      };
    }

    // Check if student year is valid (1-5)
    if (student.year < 1 || student.year > 5) {
      return {
        isValid: false,
        error: 'Student year level is invalid',
      };
    }

    // Check if student email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
      return {
        isValid: false,
        error: 'Student email format is invalid',
      };
    }

    return {
      isValid: true,
      student,
    };

  } catch (error) {
    console.error('Error in comprehensive student validation:', error);
    
    return {
      isValid: false,
      error: 'Error occurred during student validation. Please try again.',
    };
  }
}

/**
 * Search students by partial ID or name
 */
export async function searchStudents(
  query: string,
  options: {
    limit?: number;
    includeInactive?: boolean;
  } = {}
): Promise<ScanningStudent[]> {
  try {
    const { limit = 10, includeInactive = false } = options;
    
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim();
    
    // Search by student ID number (partial match)
    const students = await prisma.student.findMany({
      where: {
        OR: [
          {
            studentIdNumber: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        program: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
      take: limit,
      orderBy: [
        {
          studentIdNumber: 'asc',
        },
      ],
    });

    return students.map(student => ({
      id: student.id,
      studentId: student.studentIdNumber,
      fullName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      program: student.program.name,
      year: student.year,
      isActive: true, // Placeholder - assume active
    }));

  } catch (error) {
    console.error('Error searching students:', error);
    return [];
  }
}

/**
 * Get student by ID
 */
export async function getScanningStudentById(studentId: string): Promise<ScanningStudent | null> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        program: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
    });

    if (!student) {
      return null;
    }

    return {
      id: student.id,
      studentId: student.studentIdNumber,
      fullName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      program: student.program.name,
      year: student.year,
      isActive: true, // Placeholder - assume active
    };

  } catch (error) {
    console.error('Error getting student by ID:', error);
    return null;
  }
}

/**
 * Get student by student ID number
 */
export async function getScanningStudentByStudentId(studentIdNumber: string): Promise<ScanningStudent | null> {
  try {
    const student = await prisma.student.findUnique({
      where: { studentIdNumber },
      include: {
        program: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
    });

    if (!student) {
      return null;
    }

    return {
      id: student.id,
      studentId: student.studentIdNumber,
      fullName: `${student.firstName} ${student.lastName}`,
      email: student.email,
      program: student.program.name,
      year: student.year,
      isActive: true, // Placeholder - assume active
    };

  } catch (error) {
    console.error('Error getting student by student ID number:', error);
    return null;
  }
}

/**
 * Clear validation cache
 */
export function clearValidationCache(): void {
  validationCache.clear();
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCacheEntries(): void {
  const now = Date.now();
  const cacheDuration = DEFAULT_STUDENT_VALIDATION_CONFIG.cacheDuration * 60 * 1000;
  
  for (const [key, value] of validationCache.entries()) {
    if (now - value.timestamp > cacheDuration) {
      validationCache.delete(key);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStatistics(): {
  totalEntries: number;
  expiredEntries: number;
  validEntries: number;
} {
  const now = Date.now();
  const cacheDuration = DEFAULT_STUDENT_VALIDATION_CONFIG.cacheDuration * 60 * 1000;
  
  let expiredEntries = 0;
  let validEntries = 0;
  
  for (const [, value] of validationCache.entries()) {
    if (now - value.timestamp > cacheDuration) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  }
  
  return {
    totalEntries: validationCache.size,
    expiredEntries,
    validEntries,
  };
}
