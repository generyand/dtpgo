import { NextRequest, NextResponse } from 'next/server';
import { getOrganizerStats, getOrganizerAssignmentStats } from '@/lib/db/queries/organizers';
import { authenticateAdminApi, createAuthErrorResponse } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/organizers/stats
 * Fetch organizer statistics for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateAdminApi(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    // Fetch organizer statistics
    const [basicStats, assignmentStats] = await Promise.all([
      getOrganizerStats(),
      getOrganizerAssignmentStats(),
    ]);

    const stats = {
      ...basicStats,
      assignments: assignmentStats,
    };

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching organizer statistics:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
