import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { authenticateOrganizerApi, createAuthErrorResponse } from '@/lib/auth/api-auth';

/**
 * GET /api/organizer/sessions
 * Fetch sessions assigned to the current organizer
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate organizer user
    const authResult = await authenticateOrganizerApi(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }
    const user = authResult.user!;

    // Get organizer by email
    const organizer = await prisma.organizer.findUnique({
      where: { email: user.email! },
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
