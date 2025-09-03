import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { authenticateApiRequest } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/db/queries/activity';

// Validation schema for organizer assignment
const assignOrganizerSchema = z.object({
  organizerId: z.string().cuid('Invalid organizer ID format'),
  assignedBy: z.string().optional(), // Will be set from authenticated user
});

// Validation schema for bulk organizer assignment
const bulkAssignOrganizersSchema = z.object({
  organizerIds: z.array(z.string().cuid('Invalid organizer ID format')).min(1, 'At least one organizer ID is required'),
  assignedBy: z.string().optional(), // Will be set from authenticated user
});

// Validation schema for removing organizer assignment
const removeOrganizerSchema = z.object({
  organizerId: z.string().cuid('Invalid organizer ID format'),
  reason: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate admin request
    const authResult = await authenticateApiRequest(request, {
      requiredRole: 'admin',
      requireAuth: true,
    });

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.statusCode || 401 }
      );
    }

    const { id: eventId } = params;

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get all organizers assigned to this event
    const organizerAssignments = await prisma.organizerEventAssignment.findMany({
      where: {
        eventId,
        isActive: true,
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    // Get all available organizers (not assigned to this event)
    const assignedOrganizerIds = organizerAssignments.map(assignment => assignment.organizerId);
    const availableOrganizers = await prisma.organizer.findMany({
      where: {
        isActive: true,
        id: {
          notIn: assignedOrganizerIds,
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        isActive: event.isActive,
      },
      assignedOrganizers: organizerAssignments.map(assignment => ({
        assignmentId: assignment.id,
        organizer: assignment.organizer,
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy,
      })),
      availableOrganizers,
      statistics: {
        totalAssigned: organizerAssignments.length,
        totalAvailable: availableOrganizers.length,
        activeOrganizers: organizerAssignments.filter(a => a.organizer.isActive).length,
        adminOrganizers: organizerAssignments.filter(a => a.organizer.role === 'admin').length,
        regularOrganizers: organizerAssignments.filter(a => a.organizer.role === 'organizer').length,
      },
    });

  } catch (error) {
    console.error('Error fetching event organizers:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch event organizers',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now();
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  let authResult: any;
  let body: any;

  try {
    // Authenticate admin request
    authResult = await authenticateApiRequest(request, {
      requiredRole: 'admin',
      requireAuth: true,
    });

    if (!authResult.success || !authResult.user) {
      await logActivity({
        type: 'system_event',
        action: 'organizer_assignment_failed',
        description: `Unauthorized attempt to assign organizer to event ${params.id}`,
        severity: 'warning',
        category: 'authentication',
        metadata: { ipAddress, userAgent, error: authResult.error },
        userId: authResult.user?.id,
      });
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.statusCode || 401 }
      );
    }

    const adminUser = authResult.user;
    const { id: eventId } = params;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Check if this is a bulk assignment
    const isBulkAssignment = Array.isArray(body.organizerIds);

    if (isBulkAssignment) {
      // Handle bulk assignment
      const validationResult = bulkAssignOrganizersSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      const { organizerIds } = validationResult.data;

      // Verify event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      });

      if (!event) {
        await logActivity({
          type: 'system_event',
          action: 'organizer_assignment_failed',
          description: `Attempt to assign organizers to non-existent event: ${eventId}`,
          severity: 'warning',
          category: 'data_management',
          metadata: { assignedBy: adminUser.id, eventId, organizerIds, ipAddress, userAgent },
          userId: adminUser.id,
        });
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      // Verify all organizers exist and are active
      const organizers = await prisma.organizer.findMany({
        where: {
          id: { in: organizerIds },
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      });

      if (organizers.length !== organizerIds.length) {
        const foundIds = organizers.map(o => o.id);
        const missingIds = organizerIds.filter(id => !foundIds.includes(id));
        
        await logActivity({
          type: 'system_event',
          action: 'organizer_assignment_failed',
          description: `Attempt to assign non-existent or inactive organizers to event: ${event.name}`,
          severity: 'warning',
          category: 'data_management',
          metadata: { assignedBy: adminUser.id, eventId, missingOrganizerIds: missingIds, ipAddress, userAgent },
          userId: adminUser.id,
        });
        return NextResponse.json(
          { error: 'One or more organizers not found or inactive', missingIds },
          { status: 404 }
        );
      }

      // Check for existing assignments
      const existingAssignments = await prisma.organizerEventAssignment.findMany({
        where: {
          eventId,
          organizerId: { in: organizerIds },
          isActive: true,
        },
        select: {
          organizerId: true,
          organizer: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });

      if (existingAssignments.length > 0) {
        const alreadyAssigned = existingAssignments.map(a => a.organizer.email);
        
        await logActivity({
          type: 'system_event',
          action: 'organizer_assignment_failed',
          description: `Attempt to assign already assigned organizers to event: ${event.name}`,
          severity: 'warning',
          category: 'data_management',
          metadata: { assignedBy: adminUser.id, eventId, alreadyAssigned, ipAddress, userAgent },
          userId: adminUser.id,
        });
        return NextResponse.json(
          { error: 'One or more organizers are already assigned to this event', alreadyAssigned },
          { status: 409 }
        );
      }

      // Create bulk assignments
      const assignments = await prisma.organizerEventAssignment.createMany({
        data: organizerIds.map(organizerId => ({
          organizerId,
          eventId,
          assignedBy: adminUser.id,
        })),
      });

      await logActivity({
        type: 'admin_action',
        action: 'organizers_bulk_assigned',
        description: `Admin ${adminUser.email} assigned ${organizerIds.length} organizers to event: ${event.name}`,
        severity: 'info',
        category: 'data_management',
        metadata: {
          eventId: event.id,
          eventName: event.name,
          organizerIds,
          organizerEmails: organizers.map(o => o.email),
          assignmentCount: assignments.count,
          assignmentDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
        },
        userId: adminUser.id,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully assigned ${assignments.count} organizers to event`,
        assignments: {
          count: assignments.count,
          organizerIds,
          organizerEmails: organizers.map(o => o.email),
        },
      });

    } else {
      // Handle single assignment
      const validationResult = assignOrganizerSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationResult.error.issues,
          },
          { status: 400 }
        );
      }

      const { organizerId } = validationResult.data;

      // Verify event exists
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      });

      if (!event) {
        await logActivity({
          type: 'system_event',
          action: 'organizer_assignment_failed',
          description: `Attempt to assign organizer to non-existent event: ${eventId}`,
          severity: 'warning',
          category: 'data_management',
          metadata: { assignedBy: adminUser.id, eventId, organizerId, ipAddress, userAgent },
          userId: adminUser.id,
        });
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }

      // Verify organizer exists and is active
      const organizer = await prisma.organizer.findUnique({
        where: { id: organizerId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
        },
      });

      if (!organizer) {
        await logActivity({
          type: 'system_event',
          action: 'organizer_assignment_failed',
          description: `Attempt to assign non-existent organizer to event: ${event.name}`,
          severity: 'warning',
          category: 'data_management',
          metadata: { assignedBy: adminUser.id, eventId, organizerId, ipAddress, userAgent },
          userId: adminUser.id,
        });
        return NextResponse.json(
          { error: 'Organizer not found' },
          { status: 404 }
        );
      }

      if (!organizer.isActive) {
        await logActivity({
          type: 'system_event',
          action: 'organizer_assignment_failed',
          description: `Attempt to assign inactive organizer to event: ${event.name}`,
          severity: 'warning',
          category: 'data_management',
          metadata: { assignedBy: adminUser.id, eventId, organizerId, organizerEmail: organizer.email, ipAddress, userAgent },
          userId: adminUser.id,
        });
        return NextResponse.json(
          { error: 'Cannot assign inactive organizer' },
          { status: 400 }
        );
      }

      // Check if organizer is already assigned to this event
      const existingAssignment = await prisma.organizerEventAssignment.findFirst({
        where: {
          eventId,
          organizerId,
          isActive: true,
        },
      });

      if (existingAssignment) {
        await logActivity({
          type: 'system_event',
          action: 'organizer_assignment_failed',
          description: `Attempt to assign already assigned organizer to event: ${event.name}`,
          severity: 'warning',
          category: 'data_management',
          metadata: { assignedBy: adminUser.id, eventId, organizerId, organizerEmail: organizer.email, ipAddress, userAgent },
          userId: adminUser.id,
        });
        return NextResponse.json(
          { error: 'Organizer is already assigned to this event' },
          { status: 409 }
        );
      }

      // Create assignment
      const assignment = await prisma.organizerEventAssignment.create({
        data: {
          organizerId,
          eventId,
          assignedBy: adminUser.id,
        },
        include: {
          organizer: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      await logActivity({
        type: 'admin_action',
        action: 'organizer_assigned',
        description: `Admin ${adminUser.email} assigned organizer ${organizer.email} to event: ${event.name}`,
        severity: 'info',
        category: 'data_management',
        metadata: {
          assignmentId: assignment.id,
          eventId: event.id,
          eventName: event.name,
          organizerId: organizer.id,
          organizerEmail: organizer.email,
          organizerRole: organizer.role,
          assignmentDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
        },
        userId: adminUser.id,
      });

      return NextResponse.json({
        success: true,
        message: 'Organizer assigned successfully',
        assignment: {
          id: assignment.id,
          organizer: assignment.organizer,
          assignedAt: assignment.assignedAt,
          assignedBy: assignment.assignedBy,
        },
      });
    }

  } catch (error) {
    console.error('Error assigning organizer:', error);
    await logActivity({
      type: 'system_event',
      action: 'organizer_assignment_failed',
      description: `Failed to assign organizer to event ${params.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error',
      category: 'system',
      metadata: {
        assignedBy: authResult.user?.id,
        eventId: params.id,
        assignmentData: body,
        errorMessage: error instanceof Error ? error.message : 'Unknown',
        assignmentDuration: Date.now() - startTime,
        ipAddress,
        userAgent,
      },
      userId: authResult.user?.id,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to assign organizer',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now();
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  let authResult: any;
  let body: any;

  try {
    // Authenticate admin request
    authResult = await authenticateApiRequest(request, {
      requiredRole: 'admin',
      requireAuth: true,
    });

    if (!authResult.success || !authResult.user) {
      await logActivity({
        type: 'system_event',
        action: 'organizer_removal_failed',
        description: `Unauthorized attempt to remove organizer from event ${params.id}`,
        severity: 'warning',
        category: 'authentication',
        metadata: { ipAddress, userAgent, error: authResult.error },
        userId: authResult.user?.id,
      });
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.statusCode || 401 }
      );
    }

    const adminUser = authResult.user;
    const { id: eventId } = params;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validate request body
    const validationResult = removeOrganizerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { organizerId, reason } = validationResult.data;

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!event) {
      await logActivity({
        type: 'system_event',
        action: 'organizer_removal_failed',
        description: `Attempt to remove organizer from non-existent event: ${eventId}`,
        severity: 'warning',
        category: 'data_management',
        metadata: { removedBy: adminUser.id, eventId, organizerId, ipAddress, userAgent },
        userId: adminUser.id,
      });
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Find the assignment
    const assignment = await prisma.organizerEventAssignment.findFirst({
      where: {
        eventId,
        organizerId,
        isActive: true,
      },
      include: {
        organizer: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    if (!assignment) {
      await logActivity({
        type: 'system_event',
        action: 'organizer_removal_failed',
        description: `Attempt to remove non-assigned organizer from event: ${event.name}`,
        severity: 'warning',
        category: 'data_management',
        metadata: { removedBy: adminUser.id, eventId, organizerId, ipAddress, userAgent },
        userId: adminUser.id,
      });
      return NextResponse.json(
        { error: 'Organizer is not assigned to this event' },
        { status: 404 }
      );
    }

    // Soft delete the assignment
    const removedAssignment = await prisma.organizerEventAssignment.update({
      where: { id: assignment.id },
      data: { isActive: false },
    });

    await logActivity({
      type: 'admin_action',
      action: 'organizer_removed',
      description: `Admin ${adminUser.email} removed organizer ${assignment.organizer.email} from event: ${event.name}`,
      severity: 'info',
      category: 'data_management',
      metadata: {
        assignmentId: assignment.id,
        eventId: event.id,
        eventName: event.name,
        organizerId: assignment.organizer.id,
        organizerEmail: assignment.organizer.email,
        organizerRole: assignment.organizer.role,
        reason,
        removalDuration: Date.now() - startTime,
        ipAddress,
        userAgent,
      },
      userId: adminUser.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Organizer removed successfully',
      removedAssignment: {
        id: removedAssignment.id,
        organizer: assignment.organizer,
        assignedAt: assignment.assignedAt,
        removedAt: new Date(),
        reason,
      },
    });

  } catch (error) {
    console.error('Error removing organizer:', error);
    await logActivity({
      type: 'system_event',
      action: 'organizer_removal_failed',
      description: `Failed to remove organizer from event ${params.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error',
      category: 'system',
      metadata: {
        removedBy: authResult.user?.id,
        eventId: params.id,
        removalData: body,
        errorMessage: error instanceof Error ? error.message : 'Unknown',
        removalDuration: Date.now() - startTime,
        ipAddress,
        userAgent,
      },
      userId: authResult.user?.id,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to remove organizer',
      },
      { status: 500 }
    );
  }
}
