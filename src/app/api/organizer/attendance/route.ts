import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrganizerRequest } from '@/lib/auth/organizer-auth';
import { prisma } from '@/lib/db/client';
import { logSystemEvent } from '@/lib/db/queries/activity';
import { z } from 'zod';

// Validation schema for attendance recording
const recordAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  sessionId: z.string().min(1, 'Session ID is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  scanType: z.enum(['time_in', 'time_out']).default('time_in'),
  scannedBy: z.string().optional(), // Will be set from authenticated organizer
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // Extract request metadata
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || 'direct';

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
    const validationResult = recordAttendanceSchema.safeParse({
      ...body,
      ipAddress,
      userAgent,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { studentId, sessionId, scanType } = validationResult.data;

    // Verify session exists and organizer has access
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      await logSystemEvent(
        'attendance_recording_failed',
        `Attendance recording failed: Session not found (ID: ${sessionId})`,
        'warning',
        {
          sessionId,
          studentId,
          organizerId: organizer.id,
          errorType: 'session_not_found',
          processingDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.event.isActive) {
      await logSystemEvent(
        'attendance_recording_failed',
        `Attendance recording failed: Event is inactive (Event ID: ${session.event.id})`,
        'warning',
        {
          sessionId,
          eventId: session.event.id,
          studentId,
          organizerId: organizer.id,
          errorType: 'event_inactive',
          processingDuration: Date.now() - startTime,
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
        'attendance_recording_failed',
        `Attendance recording failed: Organizer not assigned to event (Organizer: ${organizer.id}, Event: ${session.event.id})`,
        'warning',
        {
          sessionId,
          eventId: session.event.id,
          studentId,
          organizerId: organizer.id,
          errorType: 'access_denied',
          processingDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ error: 'Access denied to this event' }, { status: 403 });
    }

    // Verify student exists (search by student ID number, not database ID)
    const student = await prisma.student.findUnique({
      where: { studentIdNumber: studentId },
      include: {
        program: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      await logSystemEvent(
        'attendance_recording_failed',
        `Attendance recording failed: Student not found (Student ID Number: ${studentId})`,
        'warning',
        {
          sessionId,
          eventId: session.event.id,
          studentIdNumber: studentId,
          organizerId: organizer.id,
          errorType: 'student_not_found',
          processingDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ 
        error: 'Student not found',
        message: `No student found with ID number: ${studentId}. Please verify the QR code is valid.`,
        studentIdNumber: studentId
      }, { status: 404 });
    }

    // Check for existing attendance record (use student.id which is the database ID)
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: student.id,
        sessionId,
        scanType,
      },
    });

    if (existingAttendance) {
      await logSystemEvent(
        'attendance_recording_failed',
        `Attendance recording failed: Duplicate attendance record (Student: ${studentId}, Session: ${sessionId}, Type: ${scanType})`,
        'warning',
        {
          sessionId,
          eventId: session.event.id,
          studentId,
          organizerId: organizer.id,
          errorType: 'duplicate_attendance',
          processingDuration: Date.now() - startTime,
          ipAddress,
          userAgent,
          referer,
        }
      );
      
      return NextResponse.json({ 
        error: 'Attendance already recorded',
        message: `${scanType === 'time_in' ? 'Time in' : 'Time out'} already recorded for this student in this session`,
      }, { status: 409 });
    }

    // Create attendance record (use student.id which is the database ID)
    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        eventId: session.event.id,
        sessionId,
        timeIn: scanType === 'time_in' ? new Date() : null,
        timeOut: scanType === 'time_out' ? new Date() : null,
        scanType,
        scannedBy: organizer.id,
        ipAddress,
        userAgent,
      },
    });

    const processingDuration = Date.now() - startTime;

    // Log successful attendance recording
    await logSystemEvent(
      'attendance_recorded',
      `Attendance recorded successfully: ${student.firstName} ${student.lastName} (${student.studentIdNumber}) - ${scanType}`,
      'info',
      {
        attendanceId: attendance.id,
        sessionId: session.id,
        eventId: session.event.id,
        eventName: session.event.name,
        studentId: student.id,
        studentIdNumber: student.studentIdNumber,
        studentName: `${student.firstName} ${student.lastName}`,
        programName: student.program?.name,
        scanType,
        organizerId: organizer.id,
        organizerEmail: organizer.email,
        processingDuration,
        ipAddress,
        userAgent,
        referer,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Attendance recorded successfully',
        attendance: {
          id: attendance.id,
          studentId: attendance.studentId,
          sessionId: attendance.sessionId,
          eventId: attendance.eventId,
          scanType: attendance.scanType,
          timeIn: attendance.timeIn,
          timeOut: attendance.timeOut,
          recordedAt: attendance.timeIn || attendance.timeOut,
        },
        student: {
          id: student.id,
          studentIdNumber: student.studentIdNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          programName: student.program?.name,
          year: student.year,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    const processingDuration = Date.now() - startTime;
    
    // Log attendance recording failure
    await logSystemEvent(
      'attendance_recording_failed',
      `Attendance recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error',
      {
        errorType: 'recording_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingDuration,
        ipAddress,
        userAgent,
        referer,
      }
    );
    
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to record attendance',
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
    const sessionId = searchParams.get('sessionId');
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const whereClause: Record<string, unknown> = {};
    
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }
    
    if (eventId) {
      whereClause.eventId = eventId;
    }

    // Get attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            program: {
              select: {
                name: true,
              },
            },
          },
        },
        session: {
          select: {
            name: true,
            timeInStart: true,
            timeInEnd: true,
          },
        },
        event: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      attendance: attendanceRecords.map(record => ({
        id: record.id,
        studentId: record.studentId,
        studentIdNumber: record.student.studentIdNumber,
        studentName: `${record.student.firstName} ${record.student.lastName}`,
        programName: record.student.program?.name,
        year: record.student.year,
        sessionId: record.sessionId,
        sessionName: record.session.name,
        eventId: record.eventId,
        eventName: record.event.name,
        scanType: record.scanType,
        timeIn: record.timeIn,
        timeOut: record.timeOut,
        scannedBy: record.scannedBy,
        createdAt: record.createdAt,
      })),
      pagination: {
        limit,
        offset,
        total: attendanceRecords.length,
      },
    });

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch attendance records',
      },
      { status: 500 }
    );
  }
}
