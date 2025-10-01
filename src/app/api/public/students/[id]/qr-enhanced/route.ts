import { NextRequest, NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries/students';
import { createBrandedStudentQRCode, StudentQRData } from '@/lib/qr/session-generator';
import { logQRGeneration, logSystemEvent } from '@/lib/db/queries/activity';
import { withRateLimit } from '@/lib/auth/rate-limit';

export const GET = withRateLimit('api', async (request: NextRequest) => {
  const startTime = Date.now();
  let studentId: string | undefined;
  
  // Extract request metadata
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || 'direct';
  
  try {
    // Extract student ID from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 2]; // Get the ID from the URL path
    studentId = id;
    
    const student = await getStudentById(id);

    if (!student) {
      // Log student not found attempt
      try {
        await logSystemEvent(
          'enhanced_qr_generation_failed',
          `Public enhanced QR generation failed: Student not found (ID: ${id})`,
          'warning',
          {
            requestedStudentId: id,
            errorType: 'student_not_found',
            generationDuration: Date.now() - startTime,
            ipAddress,
            userAgent,
            referer,
            source: 'public',
          }
        );
      } catch (activityError) {
        console.error('Failed to log public enhanced QR generation failure (student not found):', activityError);
      }
      
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Prepare student data for enhanced QR code
    const studentQRData: StudentQRData = {
      studentId: student.id,
      studentIdNumber: student.studentIdNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      programName: student.program?.name,
      year: student.year,
      timestamp: new Date().toISOString(),
    };

    // Generate enhanced branded QR code
    const qrCodeBuffer = await createBrandedStudentQRCode(studentQRData, {
      includeStudentInfo: true,
      branding: true,
    });

    const generationDuration = Date.now() - startTime;

    // Log successful QR generation
    try {
      await logQRGeneration(
        student.id,
        {
          studentIdNumber: student.studentIdNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          programId: student.programId,
          generationDuration,
          qrCodeSize: qrCodeBuffer.length,
          format: 'png',
          branded: true,
          enhanced: true,
          referer,
          source: 'public',
        },
        ipAddress,
        userAgent
      );
    } catch (activityError) {
      // Don't fail QR generation if activity logging fails
      console.error('Failed to log public enhanced QR generation activity:', activityError);
    }

    return new NextResponse(new Uint8Array(qrCodeBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="enhanced-qr-code-${student.studentIdNumber}.png"`,
        'Content-Length': qrCodeBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Generation-Duration': generationDuration.toString(),
        'X-Enhanced': 'true',
      },
    });
  } catch (error) {
    const generationDuration = Date.now() - startTime;
    
    // Extract student ID from URL for error logging
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 2];
    
    // Log QR generation failure
    try {
      await logSystemEvent(
        'enhanced_qr_generation_failed',
        `Public enhanced QR generation failed for student ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
        {
          studentId: studentId || id,
          errorType: 'generation_error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          generationDuration,
          ipAddress,
          userAgent,
          referer,
          source: 'public',
        }
      );
    } catch (activityError) {
      console.error('Failed to log public enhanced QR generation failure activity:', activityError);
    }
    
    console.error(`Failed to generate public enhanced QR code for student ${id}:`, error);
    return NextResponse.json({ error: 'Failed to generate enhanced QR code' }, { status: 500 });
  }
});
