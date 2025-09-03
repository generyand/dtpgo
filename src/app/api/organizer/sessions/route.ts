import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/organizer/sessions
 * Fetch sessions assigned to the current organizer
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

    // Check if user is organizer
    const userRole = session.user.user_metadata?.role;
    if (userRole !== 'organizer') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get organizer by email
    const organizer = await prisma.organizer.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    });

    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Fetch sessions assigned to this organizer
    const sessions = await prisma.session.findMany({
      where: {
        isActive: true,
        event: {
          organizerAssignments: {
            some: {
              organizerId: organizer.id,
            },
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            location: true,
            startDate: true,
            endDate: true,
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
      orderBy: [
        { timeInStart: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });

  } catch (error) {
    console.error('Error fetching organizer sessions:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
