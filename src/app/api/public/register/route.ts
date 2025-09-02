import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { studentSchema } from '@/lib/validations/student';
import { createStudent } from '@/lib/db/queries/students';
import { logStudentRegistration, logSystemEvent } from '@/lib/db/queries/activity';
import { withRateLimit } from '@/lib/auth/rate-limit';

export const POST = withRateLimit('registration', async (request: NextRequest) => {
  const startTime = Date.now();
  let studentId: string | undefined;
  
  // Extract request metadata
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    const body = await request.json();
    const parsed = studentSchema.parse(body);

    const student = await createStudent({
      ...parsed,
      registrationSource: 'public',
    });

    studentId = student.id;

    // Log successful registration activity
    try {
      await logStudentRegistration(
        student.id,
        'public',
        undefined, // No admin for public registrations
        {
          studentIdNumber: student.studentIdNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          programId: student.programId,
          year: student.year,
          registrationDuration: Date.now() - startTime,
          validationPassed: true,
          selfRegistration: true,
        },
        ipAddress,
        userAgent
      );
    } catch (activityError) {
      // Don't fail the registration if activity logging fails
      console.error('Failed to log public registration activity:', activityError);
    }

    return NextResponse.json({ student }, { status: 201 });
  } catch (error: unknown) {
    // Log failed registration attempt
    try {
      let errorType = 'unknown_error';
      const errorDetails: Record<string, unknown> = {
        registrationDuration: Date.now() - startTime,
        validationPassed: false,
        selfRegistration: true,
      };

      if (error instanceof z.ZodError) {
        errorType = 'validation_error';
        errorDetails.validationErrors = error.flatten().fieldErrors;
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          errorType = 'duplicate_record';
          errorDetails.duplicateFields = error.meta?.target;
        } else {
          errorType = 'database_error';
          errorDetails.prismaErrorCode = error.code;
        }
      }

      await logSystemEvent(
        'registration_failed',
        `Public registration attempt failed: ${errorType}`,
        'warning',
        {
          errorType,
          studentId,
          source: 'public',
          ipAddress,
          userAgent,
          ...errorDetails,
        }
      );
    } catch (activityError) {
      console.error('Failed to log public registration failure activity:', activityError);
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().fieldErrors }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[];
        const message = `A student with this ${target.join(', ')} already exists.`;
        return NextResponse.json({ error: message }, { status: 409 });
      }
    }

    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}); 