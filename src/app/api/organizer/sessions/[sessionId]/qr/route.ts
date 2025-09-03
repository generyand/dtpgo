import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrganizerRequest } from '@/lib/auth/organizer-auth';
import { createBrandedSessionQRCode, SessionQRData } from '@/lib/qr/session-generator';
import { prisma } from '@/lib/db/client';
import { logSystemEvent } from '@/lib/db/queries/activity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const startTime = Date.now();
  let sessionId: string | undefined;
  
  // Extract request metadata
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || 'direct';

  try {
    const { sessionId: paramSessionId } = await params;
    sessionId = paramSessionId;

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
      await logSystemEvent(
        'session_qr_generation_failed',
        `Session QR generation failed: Organizer not found in database (Email: ${user.email})`,
        'warning',
        {
          requestedSessionId: sessionId,
          userEmail: user.email,
          errorType: 'organizer_not_found',
          generationDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 });
    }

    // Get session with event information
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            location: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      await logSystemEvent(
        'session_qr_generation_failed',
        `Session QR generation failed: Session not found (ID: ${sessionId})`,
        'warning',
        {
          requestedSessionId: sessionId,
          organizerId: organizer.id,
          errorType: 'session_not_found',
          generationDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.event.isActive) {
      await logSystemEvent(
        'session_qr_generation_failed',
        `Session QR generation failed: Event is inactive (Event ID: ${session.event.id})`,
        'warning',
        {
          sessionId,
          eventId: session.event.id,
          organizerId: organizer.id,
          errorType: 'event_inactive',
          generationDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ error: 'Event is not active' }, { status: 400 });
    }

    // Check if organizer has access to this event
    const hasAccess = await prisma.organizerEventAssignment.findFirst({
      where: {
        organizerId: organizer.id,
        eventId: session.event.id,
      },
    });

    if (!hasAccess) {
      await logSystemEvent(
        'session_qr_generation_failed',
        `Session QR generation failed: Organizer not assigned to event (Organizer: ${organizer.id}, Event: ${session.event.id})`,
        'warning',
        {
          sessionId,
          eventId: session.event.id,
          organizerId: organizer.id,
          errorType: 'access_denied',
          generationDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ error: 'Access denied to this event' }, { status: 403 });
    }

    // Prepare session data for QR code
    const sessionQRData: SessionQRData = {
      sessionId: session.id,
      eventId: session.event.id,
      eventName: session.event.name,
      sessionName: session.name,
      startTime: session.timeInStart.toISOString(),
      endTime: session.timeInEnd.toISOString(),
      location: session.event.location || undefined,
      organizerId: organizer.id,
      timestamp: new Date().toISOString(),
    };

    // Generate branded QR code
    const qrCodeBuffer = await createBrandedSessionQRCode(sessionQRData, {
      includeEventInfo: true,
      includeOrganizerInfo: true,
      branding: true,
    });

    const generationDuration = Date.now() - startTime;

    // Log successful QR generation
    await logSystemEvent(
      'session_qr_generated',
      `Session QR code generated successfully for session: ${session.name}`,
      'info',
      {
        sessionId: session.id,
        eventId: session.event.id,
        eventName: session.event.name,
        sessionName: session.name,
        organizerId: organizer.id,
        organizerEmail: organizer.email,
        generationDuration,
        qrCodeSize: qrCodeBuffer.length,
        format: 'png',
        branded: true,
        ipAddress,
        userAgent,
        referer,
      }
    );

    return new NextResponse(new Uint8Array(qrCodeBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="session-qr-${session.name.replace(/[^a-zA-Z0-9]/g, '-')}.png"`,
        'Content-Length': qrCodeBuffer.length.toString(),
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'X-Generation-Duration': generationDuration.toString(),
        'X-Session-Id': session.id,
        'X-Event-Id': session.event.id,
      },
    });

  } catch (error) {
    const generationDuration = Date.now() - startTime;
    
    // Log QR generation failure
    await logSystemEvent(
      'session_qr_generation_failed',
      `Session QR generation failed for session ${sessionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error',
      {
        sessionId: sessionId || 'unknown',
        errorType: 'generation_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        generationDuration,
        ipAddress,
        userAgent,
        referer,
      }
    );
    
    console.error(`Failed to generate session QR code for session ${sessionId}:`, error);
    return NextResponse.json({ error: 'Failed to generate session QR code' }, { status: 500 });
  }
}
