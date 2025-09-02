import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivities } from '@/lib/db/queries/activity';
import { z } from 'zod';
import { authenticatePermissionApi } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  severity: z.enum(['info', 'success', 'warning', 'error', 'critical', 'debug']).optional(),
  category: z.enum(['registration', 'authentication', 'data_management', 'system', 'analytics', 'security', 'maintenance']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticatePermissionApi(request, 'canViewAnalytics');
    if (!authResult.success) {
      return authResult.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = querySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.flatten() }, { status: 400 });
    }

    const { limit, offset, severity, category } = validation.data;

    const activities = await getRecentActivities({
      limit,
      offset,
      severity,
      category,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Failed to fetch recent activities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
