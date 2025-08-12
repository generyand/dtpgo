import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { studentSchema } from '@/lib/validations/student';
import { createStudent } from '@/lib/db/queries/students';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = studentSchema.parse(body);

    const student = await createStudent({
      ...parsed,
      registrationSource: 'public',
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error: unknown) {
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
} 