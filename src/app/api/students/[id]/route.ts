import { NextRequest, NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries/students';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const student = await getStudentById(id);
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 