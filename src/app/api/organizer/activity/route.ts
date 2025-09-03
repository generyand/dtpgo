import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrganizerRequest } from '@/lib/auth/organizer-auth';
import { trackOrganizerActivity } from '@/lib/auth/organizer-session';
import { prisma } from '@/lib/db/client';
import { z } from 'zod';

// Validation schema for activity tracking
const trackActivitySchema = z.object({
  action: z.string().min(1, 'Action is required'),
  details: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate organizer request
    const authResult = await authenticateOrganizerRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.statusCode || 401 }
      );
    }

    const user = authResult.user!;

    // Get organizer record from database
    const organizer = await prisma.organizer.findUnique({
      where: { email: user.email! },
    });

    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = trackActivitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { action, details } = validationResult.data;

    // Track the activity
    await trackOrganizerActivity(organizer.id, action, details);

    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully',
    });

  } catch (error) {
    console.error('Error tracking organizer activity:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to track activity',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate organizer request
    const authResult = await authenticateOrganizerRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.statusCode || 401 }
      );
    }

    const user = authResult.user!;

    // Get organizer record from database
    const organizer = await prisma.organizer.findUnique({
      where: { email: user.email! },
    });

    if (!organizer) {
      return NextResponse.json(
        { error: 'Organizer not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');

    // Build where clause
    const whereClause: any = {
      organizerId: organizer.id,
    };

    if (action) {
      whereClause.metadata = {
        path: ['action'],
        equals: action,
      };
    }

    // Get activity records
    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      activities: activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        action: (activity.metadata as any)?.action,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })),
      pagination: {
        limit,
        offset,
        total: activities.length,
      },
    });

  } catch (error) {
    console.error('Error fetching organizer activities:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch activities',
      },
      { status: 500 }
    );
  }
}
