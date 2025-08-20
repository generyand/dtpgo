/**
 * Student Query Functions
 *
 * This file contains all database query functions related to the Student model.
 * These functions are designed to be used by API endpoints and other services
 * to interact with the student data in a structured and type-safe manner.
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../client';
import { createBrandedQRCode } from '@/lib/qr/branding';

/**
 * Type definition for the result of student queries, including the program.
 */
export type StudentWithProgram = Prisma.StudentGetPayload<{
  include: { program: true };
}>;

/**
 * Type definition for creating a new student.
 * Excludes fields that are auto-generated.
 */
export type CreateStudentData = Omit<Prisma.StudentCreateInput, 'program'> & {
  programId: string;
};

/**
 * Fetches a list of students with pagination, sorting, and filtering.
 *
 * @param options - Options for pagination, sorting, and filtering.
 * @returns A promise that resolves to an array of students with their program details.
 */
export async function getStudents(options: {
  page?: number;
  limit?: number;
  sortBy?: keyof Prisma.StudentOrderByWithRelationInput;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  program?: string; // Changed from programId to program for consistency with API
  year?: number;
  registrationSource?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<StudentWithProgram[]> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
    program,
    year,
    registrationSource,
    dateFrom,
    dateTo,
  } = options;

  const where: Prisma.StudentWhereInput = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { studentIdNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (program) {
    where.programId = program;
  }

  if (year) {
    where.year = year;
  }

  if (registrationSource) {
    where.registrationSource = registrationSource;
  }

  // Date range filtering
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      // Add 23:59:59 to include the entire day
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  return prisma.student.findMany({
    where,
    include: {
      program: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (page - 1) * limit,
    take: limit,
  });
}

/**
 * Fetches a single student by their unique ID.
 *
 * @param id - The unique ID of the student.
 * @returns A promise that resolves to the student object or null if not found.
 */
export async function getStudentById(id: string, options: { includeQRCode?: boolean } = {}): Promise<StudentWithProgram & { qrCodeDataUrl?: string } | null> {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { program: true },
  });

  if (!student) {
    return null;
  }

  if (options.includeQRCode) {
    const qrCodeBuffer = await createBrandedQRCode({
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentIdNumber,
    });
    return {
      ...student,
      qrCodeDataUrl: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
    };
  }

  return student;
}

/**
 * Creates a new student in the database.
 *
 * @param data - The data for the new student.
 * @returns A promise that resolves to the newly created student object.
 */
export async function createStudent(data: CreateStudentData): Promise<StudentWithProgram> {
  const { programId, ...studentData } = data;
  return prisma.student.create({
    data: {
      ...studentData,
      program: {
        connect: { id: programId },
      },
    },
    include: {
      program: true,
    },
  });
}

/**
 * Updates an existing student's data.
 *
 * @param id - The unique ID of the student to update.
 * @param data - The data to update.
 * @returns A promise that resolves to the updated student object.
 */
export async function updateStudent(
  id: string,
  data: Partial<CreateStudentData>
): Promise<StudentWithProgram> {
  const { programId, ...studentData } = data;
  const updatePayload: Prisma.StudentUpdateInput = { ...studentData };

  if (programId) {
    updatePayload.program = {
      connect: { id: programId },
    };
  }

  return prisma.student.update({
    where: { id },
    data: updatePayload,
    include: {
      program: true,
    },
  });
}

/**
 * Deletes a student from the database.
 *
 * @param id - The unique ID of the student to delete.
 * @returns A promise that resolves when the student is deleted.
 */
export async function deleteStudent(id: string): Promise<void> {
  await prisma.student.delete({
    where: { id },
  });
}

/**
 * Counts the total number of students based on optional filters.
 *
 * @param options - Options for filtering.
 * @returns A promise that resolves to the total number of students.
 */
export async function countStudents(options: {
  search?: string;
  program?: string; // Changed from programId to program for consistency
  year?: number;
  registrationSource?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<number> {
  const { search, program, year, registrationSource, dateFrom, dateTo } = options;
  
  const where: Prisma.StudentWhereInput = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { studentIdNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (program) {
    where.programId = program;
  }

  if (year) {
    where.year = year;
  }

  if (registrationSource) {
    where.registrationSource = registrationSource;
  }

  // Date range filtering (same logic as getStudents)
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }
  
  return prisma.student.count({ where });
} 