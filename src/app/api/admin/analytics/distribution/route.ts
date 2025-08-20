import { NextResponse } from 'next/server';
import { getProgramDistribution } from '@/lib/db/queries/analytics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const distributionData = await getProgramDistribution();
    return NextResponse.json(distributionData);
  } catch (error) {
    console.error('Failed to fetch program distribution:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 },
    );
  }
}
