import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { authenticatePermissionApi } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticatePermissionApi(request, 'canViewAnalytics');
    if (!authResult.success) {
      return authResult.response;
    }

    const programs = await prisma.program.findMany({
      where: {
        isActive: true, // Only return active programs
      },
      select: {
        id: true,
        name: true,
        displayName: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load programs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}