import { NextResponse } from 'next/server';
import { countStudents } from '@/lib/db/queries/students';
import { getPrograms } from '@/lib/db/queries/programs';
import {
  countStudentsByProgram,
  countStudentsByRegistrationSource,
} from '@/lib/db/queries/analytics';

export async function GET() {
  try {
    const [
      totalStudents,
      programs,
      studentsByProgram,
      studentsBySource,
    ] = await Promise.all([
      countStudents({}),
      getPrograms(),
      countStudentsByProgram(),
      countStudentsByRegistrationSource(),
    ]);

    const analyticsData = {
      totalStudents,
      totalPrograms: programs.length,
      studentsByProgram,
      studentsBySource,
    };

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load analytics data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 