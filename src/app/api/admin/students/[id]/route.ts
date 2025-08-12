import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { studentSchema } from '@/lib/validations/student';
import { updateStudent, deleteStudent } from '@/lib/db/queries/students';

// PUT handler for updating a student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = studentSchema.partial().parse(body); // Allow partial updates
    const student = await updateStudent(params.id, parsed);
    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', issues: error.issues }, { status: 400 });
    }
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler for deleting a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteStudent(params.id);
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 