import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { studentSchema } from '@/lib/validations/student'
import { createStudent } from '@/lib/db/queries/students'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const parsed = studentSchema.parse(body)

    // Create student
    const student = await createStudent({
      studentIdNumber: parsed.studentIdNumber,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      year: parsed.year,
      programId: parsed.programId,
      registrationSource: 'admin',
    })

    // Optionally send email here when email service is available in Epic 6

    return NextResponse.json({ student }, { status: 201 })
  } catch (error: unknown) {
    // Zod validation error
    if (error instanceof ZodError) {
      const issues = error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
      return NextResponse.json({ error: 'Validation failed', issues }, { status: 400 })
    }

    // Prisma unique constraint errors and others
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint failed on the fields: (constraint details)
        return NextResponse.json({ error: 'Duplicate record', detail: error.meta?.target || null }, { status: 409 })
      }
    }

    console.error('Admin register API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 