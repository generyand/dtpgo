import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { subDays, endOfDay, startOfDay } from 'date-fns';
import { getStudentRegistrationsByDateRange } from '@/lib/db/queries/analytics';
import { processRegistrationTrends } from '@/lib/utils/chart-data';
import { TimePeriod } from '@/components/admin/dashboard/ChartFilters';

export const dynamic = 'force-dynamic';

const schema = z.object({
  period: z.enum(['7d', '30d', '90d']).default('30d'),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get('period') as TimePeriod) || '30d';

  const validation = schema.safeParse({ period });

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid period specified.' },
      { status: 400 },
    );
  }

  try {
    const { period: validatedPeriod } = validation.data;
    const days = parseInt(validatedPeriod.replace('d', ''), 10);
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));

    const students = await getStudentRegistrationsByDateRange(
      startDate,
      endDate,
    );
    const trendData = processRegistrationTrends(students, startDate, endDate);

    return NextResponse.json(trendData);
  } catch (error) {
    console.error('Failed to fetch registration trends:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 },
    );
  }
}
