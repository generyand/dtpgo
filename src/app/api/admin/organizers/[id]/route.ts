import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { prisma } from '@/lib/db/client';

/**
 * GET /api/admin/organizers/[id]
 * Fetch individual organizer details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const organizerId = params.id;

    // Fetch organizer with related data (explicit select for accurate TS types)
    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
      select: {
        id: true,
        role: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        fullName: true,
        invitedBy: true,
        invitedAt: true,
        lastLoginAt: true,
        eventAssignments: {
          where: { isActive: true },
          orderBy: { assignedAt: 'desc' },
          select: {
            id: true,
            assignedAt: true,
            event: {
              select: {
                id: true,
                name: true,
                description: true,
                startDate: true,
                endDate: true,
                isActive: true,
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
            eventId: true,
            sessionId: true,
          },
        },
      },
    });

    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Calculate additional statistics
    const totalAssignments = organizer.eventAssignments.length;
    const activeEvents = organizer.eventAssignments.filter(
      assignment => assignment.event.isActive === true
    ).length;

    const organizerWithStats = {
      ...organizer,
      statistics: {
        totalAssignments,
        activeEvents,
        recentActivityCount: organizer.activities.length,
      },
    };

    return NextResponse.json({
      success: true,
      organizer: organizerWithStats,
    });

  } catch (error) {
    console.error('Error fetching organizer details:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/organizers/[id]
 * Update organizer details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const organizerId = params.id;
    const body = await request.json();
    const { fullName, role, isActive } = body;

    // Validate input
    if (!fullName && !role && isActive === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Check if organizer exists
    const existingOrganizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
    });

    if (!existingOrganizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Update organizer
    const updatedOrganizer = await prisma.organizer.update({
      where: { id: organizerId },
      data: {
        ...(fullName && { fullName }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        invitedBy: true,
        invitedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      organizer: updatedOrganizer,
      message: 'Organizer updated successfully',
    });

  } catch (error) {
    console.error('Error updating organizer:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/organizers/[id]
 * Deactivate organizer (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const organizerId = params.id;

    // Check if organizer exists
    const existingOrganizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
    });

    if (!existingOrganizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    const deactivatedOrganizer = await prisma.organizer.update({
      where: { id: organizerId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      organizer: deactivatedOrganizer,
      message: 'Organizer deactivated successfully',
    });

  } catch (error) {
    console.error('Error deactivating organizer:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
