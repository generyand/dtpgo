import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrganizerRequest } from '@/lib/auth/organizer-auth';
import { getEnhancedOrganizerSession, getOrganizerActiveSessions } from '@/lib/auth/organizer-session';
import { prisma } from '@/lib/db/client';

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

    // Get enhanced organizer session
    const session = await getEnhancedOrganizerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Failed to get organizer session' },
        { status: 500 }
      );
    }

    // Get active sessions
    const activeSessions = await getOrganizerActiveSessions(organizer.id);

    return NextResponse.json({
      success: true,
      session,
      activeSessions,
    });

  } catch (error) {
    console.error('Error getting organizer session:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to get organizer session',
      },
      { status: 500 }
    );
  }
}
