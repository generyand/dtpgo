import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { prisma } from '@/lib/db/client';
import { logActivity } from '@/lib/db/queries/activity';
import { z } from 'zod';

// Validation schema for organizer updates
const organizerUpdateSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .optional(),
  role: z.enum(['organizer', 'admin'])
    .optional(),
  isActive: z.boolean()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

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
 * Update organizer details with enhanced validation and activity logging
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

    // Validate input using Zod schema
    const validationResult = organizerUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { fullName, role, isActive } = validationResult.data;

    // Check if organizer exists
    const existingOrganizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!existingOrganizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    const changes: string[] = [];

    if (fullName !== undefined && fullName !== existingOrganizer.fullName) {
      updateData.fullName = fullName;
      changes.push(`name: "${existingOrganizer.fullName}" → "${fullName}"`);
    }

    if (role !== undefined && role !== existingOrganizer.role) {
      updateData.role = role;
      changes.push(`role: "${existingOrganizer.role}" → "${role}"`);
    }

    if (isActive !== undefined && isActive !== existingOrganizer.isActive) {
      updateData.isActive = isActive;
      changes.push(`status: ${existingOrganizer.isActive ? 'active' : 'inactive'} → ${isActive ? 'active' : 'inactive'}`);
    }

    // If no changes, return success without updating
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        organizer: existingOrganizer,
        message: 'No changes detected',
      });
    }

    // Update organizer in a transaction
    const updatedOrganizer = await prisma.$transaction(async (tx) => {
      // Update organizer
      const organizer = await tx.organizer.update({
        where: { id: organizerId },
        data: updateData,
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

      // Log activity
      await logActivity({
        type: 'admin_action',
        action: 'organizer_update',
        description: `Organizer profile updated: ${changes.join(', ')}`,
        userId: session.user.id,
        metadata: {
          organizerId,
          organizerEmail: organizer.email,
          changes: updateData,
          previousValues: {
            fullName: existingOrganizer.fullName,
            role: existingOrganizer.role,
            isActive: existingOrganizer.isActive,
          },
        },
        source: 'admin',
        severity: 'info',
        category: 'data_management',
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return organizer;
    });

    return NextResponse.json({
      success: true,
      organizer: updatedOrganizer,
      message: 'Organizer updated successfully',
      changes: changes,
    });

  } catch (error) {
    console.error('Error updating organizer:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'Organizer not found' },
          { status: 404 }
        );
      }
    }
    
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
