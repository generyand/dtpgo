import { NextRequest, NextResponse } from 'next/server';
import { getProgramDistribution } from '@/lib/db/queries/analytics';
import { authenticatePermissionApi } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Authenticate the request
  const authResult = await authenticatePermissionApi(request, 'canViewAnalytics');
  if (!authResult.success) {
    return Response.json(
      { error: authResult.error || 'Authentication failed' },
      { status: authResult.statusCode || 401 }
    );
  }

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
