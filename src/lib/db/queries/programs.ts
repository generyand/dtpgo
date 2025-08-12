/**
 * Program Query Functions
 *
 * This file contains all database query functions related to the Program model.
 * These functions are used to manage academic programs within the system.
 */

import { Prisma, Program } from '@prisma/client';
import { prisma } from '../client';

/**
 * Type definition for creating a new program.
 */
export type CreateProgramData = Omit<Prisma.ProgramCreateInput, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Narrowed type for listing programs in UIs where only core fields are needed.
 */
export type ProgramListItem = Pick<Program, 'id' | 'name' | 'displayName' | 'isActive'>;

/**
 * Fetches a list of programs.
 * By default, it returns only active programs.
 *
 * @param options - Options to include inactive programs.
 * @returns A promise that resolves to an array of programs.
 */
export async function getPrograms(options?: { includeInactive?: boolean }): Promise<ProgramListItem[]> {
  const where: Prisma.ProgramWhereInput = {};

  if (!options?.includeInactive) {
    where.isActive = true;
  }

  return prisma.program.findMany({
    where,
    orderBy: {
      displayName: 'asc',
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      isActive: true,
    },
  });
}

/**
 * Fetches a single program by its unique ID.
 *
 * @param id - The unique ID of the program.
 * @returns A promise that resolves to the program object or null if not found.
 */
export async function getProgramById(id: string): Promise<Program | null> {
  return prisma.program.findUnique({
    where: { id },
  });
}

/**
 * Creates a new program in the database.
 *
 * @param data - The data for the new program.
 * @returns A promise that resolves to the newly created program object.
 */
export async function createProgram(data: CreateProgramData): Promise<Program> {
  return prisma.program.create({
    data,
  });
}

/**
 * Updates an existing program's data.
 *
 * @param id - The unique ID of the program to update.
 * @param data - The data to update.
 * @returns A promise that resolves to the updated program object.
 */
export async function updateProgram(
  id: string,
  data: Partial<CreateProgramData>
): Promise<Program> {
  return prisma.program.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a program from the database.
 * This is a hard delete. Consider soft-deleting by setting `isActive` to false.
 *
 * @param id - The unique ID of the program to delete.
 * @returns A promise that resolves when the program is deleted.
 */
export async function deleteProgram(id: string): Promise<void> {
  await prisma.program.delete({
    where: { id },
  });
} 