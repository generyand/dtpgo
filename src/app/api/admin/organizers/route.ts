import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import type { Prisma } from '@prisma/client';
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrganizerWhereInput = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role !== 'all') {
      where.role = role;
    }

    if (status !== 'all') {
      where.isActive = status === 'active';
    }

    // Fetch organizers from database with pagination
    const [organizers, totalCount] = await Promise.all([
      prisma.organizer.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          invitedAt: true,
          invitedBy: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.organizer.count({ where }),
    ]);

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
      count: totalCount,
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
      if (!existingOrganizer.isActive) {
        // Reactivate the organizer
        const reactivatedOrganizer = await prisma.organizer.update({
          where: { id: existingOrganizer.id },
          data: {
            isActive: true,
            fullName, // Update name if provided
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          organizer: reactivatedOrganizer,
          message: 'Organizer reactivated successfully',
        });
      }

      return NextResponse.json(
        { error: 'An organizer with this email address already exists.' },
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
