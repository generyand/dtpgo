import { NextRequest, NextResponse } from 'next/server';
import { getStudents, countStudents } from '@/lib/db/queries/students';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const [students, total] = await Promise.all([
      getStudents({ page, limit, search }),
      countStudents({ search }),
    ]);

    return NextResponse.json({ students, total }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load students';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 