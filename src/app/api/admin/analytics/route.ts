import { NextRequest, NextResponse } from 'next/server';
import { countStudents } from '@/lib/db/queries/students';
import { getPrograms } from '@/lib/db/queries/programs';
import {
  countStudentsByProgram,
  countStudentsByRegistrationSource,
} from '@/lib/db/queries/analytics';
import { authenticatePermissionApi, createAuthErrorResponse } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  // Check if user has permission to view analytics
  const authResult = await authenticatePermissionApi(request, 'canViewAnalytics');
  
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }
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