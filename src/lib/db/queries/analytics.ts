import { prisma } from '../client';

/**
 * Counts students grouped by their academic program.
 * @returns A promise that resolves to an array of objects, each containing a program name and the count of students.
 */
export async function countStudentsByProgram() {
  const result = await prisma.student.groupBy({
    by: ['programId'],
    _count: {
      studentIdNumber: true,
    },
  });

  const programs = await prisma.program.findMany({
    where: {
      id: { in: result.map(r => r.programId) },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const programMap = new Map(programs.map(p => [p.id, p.name]));

  return result.map(r => ({
    program: programMap.get(r.programId) || 'Unknown',
    count: r._count.studentIdNumber,
  }));
}

/**
 * Counts students grouped by their registration source (admin or public).
 * @returns A promise that resolves to an array of objects, each containing a registration source and the count of students.
 */
export async function countStudentsByRegistrationSource() {
  const result = await prisma.student.groupBy({
    by: ['registrationSource'],
    _count: {
      studentIdNumber: true,
    },
  });

  return result.map(r => ({
    source: r.registrationSource,
    count: r._count.studentIdNumber,
  }));
}

export interface ProgramDistributionData {
  name: string;
  count: number;
  percentage: number;
}

export async function getProgramDistribution(): Promise<ProgramDistributionData[]> {
  const totalStudents = await prisma.student.count();

  if (totalStudents === 0) {
    return [];
  }

  const programCounts = await prisma.student.groupBy({
    by: ['programId'],
    _count: {
      studentIdNumber: true,
    },
  });

  const programs = await prisma.program.findMany({
    where: {
      id: { in: programCounts.map(p => p.programId) },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const programMap = new Map(programs.map(p => [p.id, p.name]));

  return programCounts.map(item => {
    const count = item._count.studentIdNumber;
    const percentage = parseFloat(((count / totalStudents) * 100).toFixed(2));
    return {
      name: programMap.get(item.programId) || 'Unknown',
      count,
      percentage,
    };
  });
}

export async function getStudentRegistrationsByDateRange(
  startDate: Date,
  endDate: Date,
) {
  return prisma.student.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
} 