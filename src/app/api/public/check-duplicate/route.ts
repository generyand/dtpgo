import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const { email, studentIdNumber } = await request.json();

    if (!email && !studentIdNumber) {
      return NextResponse.json({ error: 'Email or Student ID is required' }, { status: 400 });
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { email: email ? email : undefined },
          { studentIdNumber: studentIdNumber ? studentIdNumber : undefined },
        ],
      },
    });

    return NextResponse.json({ isDuplicate: !!existingStudent }, { status: 200 });
  } catch (error) {
    console.error('Error checking for duplicate student:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 