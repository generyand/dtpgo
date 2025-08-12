import { NextRequest, NextResponse } from 'next/server';
import { getStudentById } from '@/lib/db/queries/students';
import { createBrandedQRCode } from '@/lib/qr/branding';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const student = await getStudentById(id);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const qrCodeBuffer = await createBrandedQRCode({
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentIdNumber,
    });

    return new NextResponse(qrCodeBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-code-${student.studentIdNumber}.png"`,
      },
    });
  } catch (error) {
    console.error(`Failed to generate QR code for student ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
} 