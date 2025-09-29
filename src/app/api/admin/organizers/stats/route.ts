import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { getOrganizerStats, getOrganizerAssignmentStats } from '@/lib/db/queries/organizers';

/**
 * GET /api/admin/organizers/stats
 * Fetch organizer statistics for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client for server-side operations
    const supabase = await createSupabaseServerClient();
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRole = session.user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
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
