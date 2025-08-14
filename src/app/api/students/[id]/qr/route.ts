import { NextRequest, NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries/students';
import { createBrandedQRCode } from '@/lib/qr/branding';
import { logQRGeneration, logSystemEvent } from '@/lib/db/queries/activity';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  let studentId: string | undefined;
  
  // Extract request metadata
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const referer = request.headers.get('referer') || 'direct';
  
  try {
    const { id } = await params;
    studentId = id;
    
    const student = await getStudentById(id);

    if (!student) {
      // Log student not found attempt
      try {
        await logSystemEvent(
          'qr_generation_failed',
          `QR generation failed: Student not found (ID: ${id})`,
          'warning',
          {
            requestedStudentId: id,
            errorType: 'student_not_found',
            generationDuration: Date.now() - startTime,
            ipAddress,
            userAgent,
            referer,
          }
        );
      } catch (activityError) {
        console.error('Failed to log QR generation failure (student not found):', activityError);
      }
      
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate QR code
    const qrCodeBuffer = await createBrandedQRCode({
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentIdNumber,
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
          referer,
        },
        ipAddress,
        userAgent
      );
    } catch (activityError) {
      // Don't fail QR generation if activity logging fails
      console.error('Failed to log QR generation activity:', activityError);
    }

    return new NextResponse(new Uint8Array(qrCodeBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-code-${student.studentIdNumber}.png"`,
        'Content-Length': qrCodeBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Generation-Duration': generationDuration.toString(),
      },
    });
  } catch (error) {
    const { id } = await params;
    const generationDuration = Date.now() - startTime;
    
    // Log QR generation failure
    try {
      await logSystemEvent(
        'qr_generation_failed',
        `QR generation failed for student ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error',
        {
          studentId: studentId || id,
          errorType: 'generation_error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          generationDuration,
          ipAddress,
          userAgent,
          referer,
        }
      );
    } catch (activityError) {
      console.error('Failed to log QR generation failure activity:', activityError);
    }
    
    console.error(`Failed to generate QR code for student ${id}:`, error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
} 