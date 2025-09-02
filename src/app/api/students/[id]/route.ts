import { NextRequest, NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries/students';
import { authenticatePermissionApi } from '@/lib/auth/api-auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    // Authenticate the request
    const authResult = await authenticatePermissionApi(req, 'canManageStudents');
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    
    // Validate the ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid student ID provided' }, 
        { status: 400 }
      );
    }

    const student = await getStudentById(id.trim());
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found. Please verify the student ID is correct.' }, 
        { status: 404 }
      );
    }

    // Return only safe, public information
    const publicStudentData = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      studentIdNumber: student.studentIdNumber,
      program: student.program ? {
        id: student.program.id,
        name: student.program.name,
        displayName: student.program.displayName
      } : null
    };

    return NextResponse.json(publicStudentData);
  } catch (error) {
    console.error('Failed to fetch student:', error);
    
    // Provide different error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('Invalid input syntax')) {
        return NextResponse.json(
          { error: 'Invalid student ID format' }, 
          { status: 400 }
        );
      }
      
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again later.' }, 
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Unable to retrieve student information. Please try again later.' }, 
      { status: 500 }
    );
  }
} 