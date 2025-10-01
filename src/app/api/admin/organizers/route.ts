import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { authenticateAdminApi, createAuthErrorResponse } from '@/lib/auth/api-auth';
// import { logActivity } from '@/lib/utils/activity-logger';

/**
 * GET /api/admin/organizers
 * Fetch all organizers for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateAdminApi(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    // Fetch organizers from database
    const organizers = await prisma.organizer.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Log the activity
    // await logActivity({
    //   action: 'organizers_fetched',
    //   details: {
    //     count: organizers.length,
    //     requestedBy: session.user.email,
    //   },
    //   userId: session.user.id,
    // });

    return NextResponse.json({
      success: true,
      organizers,
      count: organizers.length,
    });

  } catch (error) {
    console.error('Error fetching organizers:', error);
    
    // Log the error
    // await logActivity({
    //   action: 'organizers_fetch_error',
    //   details: {
    //     error: error instanceof Error ? error.message : 'Unknown error',
    //   },
    // });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/organizers
 * Create a new organizer (invite)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const authResult = await authenticateAdminApi(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { email, fullName } = body;

    // Validate input
    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Email and full name are required' },
        { status: 400 }
      );
    }

    // Check if organizer already exists
    const existingOrganizer = await prisma.organizer.findUnique({
      where: { email },
    });

    if (existingOrganizer) {
      return NextResponse.json(
        { error: 'Organizer with this email already exists' },
        { status: 409 }
      );
    }

    // Create organizer record
    const newOrganizer = await prisma.organizer.create({
      data: {
        email,
        fullName,
        role: 'organizer',
        isActive: true,
      },
    });

    // Log the activity
    // await logActivity({
    //   action: 'organizer_created',
    //   details: {
    //     email: newOrganizer.email,
    //     fullName,
    //     createdBy: session.user.email,
    //   },
    //   userId: session.user.id,
    // });

    return NextResponse.json({
      success: true,
      organizer: newOrganizer,
      message: 'Organizer created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating organizer:', error);
    
    // Log the error
    // await logActivity({
    //   action: 'organizer_creation_error',
    //   details: {
    //     error: error instanceof Error ? error.message : 'Unknown error',
    //   },
    // });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
