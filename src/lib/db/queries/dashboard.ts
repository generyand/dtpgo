import { prisma } from '../client';
import { 
  DashboardData, 
  DashboardMetrics, 
  PeriodComparison 
} from '@/lib/types/dashboard';

/**
 * Dashboard-specific database queries for metrics and analytics
 * Provides functions for current/previous period metrics and percentage calculations
 */

/**
 * Get current dashboard metrics
 * @returns Promise<DashboardMetrics>
 */
export async function getCurrentDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const [
      totalStudents,
      totalPrograms,
      registrationsBySource,
      activePrograms
    ] = await Promise.all([
      // Total students count
      prisma.student.count(),
      
      // Total programs count
      prisma.program.count(),
      
      // Students grouped by registration source
      prisma.student.groupBy({
        by: ['registrationSource'],
        _count: {
          id: true,
        },
      }),
      
      // Count of programs that have students
      prisma.program.count({
        where: {
          students: {
            some: {},
          },
        },
      }),
    ]);

    // Extract registration counts by source
    const publicRegistrations = registrationsBySource.find(
      (item) => item.registrationSource === 'public'
    )?._count.id || 0;

    const adminRegistrations = registrationsBySource.find(
      (item) => item.registrationSource === 'admin'
    )?._count.id || 0;

    // Estimate QR codes generated (assuming each student gets one)
    const qrCodesGenerated = totalStudents;

    return {
      totalStudents,
      totalPrograms,
      publicRegistrations,
      adminRegistrations,
      qrCodesGenerated,
      activePrograms,
    };
  } catch (error) {
    console.error('Error fetching current dashboard metrics:', error);
    throw new Error('Failed to fetch dashboard metrics');
  }
}

/**
 * Get dashboard metrics for a specific date range
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 * @returns Promise<DashboardMetrics>
 */
export async function getDashboardMetricsForPeriod(
  startDate: Date,
  endDate: Date
): Promise<DashboardMetrics> {
  try {
    const [
      totalStudents,
      totalPrograms,
      registrationsBySource,
      activePrograms
    ] = await Promise.all([
      // Students created in the period
      prisma.student.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      // Total programs (doesn't change by period typically)
      prisma.program.count(),
      
      // Students grouped by registration source for the period
      prisma.student.groupBy({
        by: ['registrationSource'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
      }),
      
      // Programs with students in the period
      prisma.program.count({
        where: {
          students: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      }),
    ]);

    const publicRegistrations = registrationsBySource.find(
      (item) => item.registrationSource === 'public'
    )?._count.id || 0;

    const adminRegistrations = registrationsBySource.find(
      (item) => item.registrationSource === 'admin'
    )?._count.id || 0;

    const qrCodesGenerated = totalStudents;

    return {
      totalStudents,
      totalPrograms,
      publicRegistrations,
      adminRegistrations,
      qrCodesGenerated,
      activePrograms,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics for period:', error);
    throw new Error('Failed to fetch dashboard metrics for period');
  }
}

/**
 * Get students registered in the last N days
 * @param days - Number of days to look back
 * @returns Promise<number>
 */
export async function getStudentsRegisteredInLastDays(days: number): Promise<number> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.student.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });
  } catch (error) {
    console.error(`Error fetching students registered in last ${days} days:`, error);
    throw new Error(`Failed to fetch students registered in last ${days} days`);
  }
}

/**
 * Get comprehensive dashboard data with period comparisons
 * @param currentPeriodDays - Number of days for current period (default: 30)
 * @returns Promise<DashboardData>
 */
export async function getComprehensiveDashboardData(
  currentPeriodDays: number = 30
): Promise<DashboardData> {
  try {
    const now = new Date();
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(now.getDate() - currentPeriodDays);

    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(currentPeriodStart.getDate() - currentPeriodDays);

    const [currentMetrics, currentPeriodMetrics, previousPeriodMetrics] = await Promise.all([
      getCurrentDashboardMetrics(),
      getDashboardMetricsForPeriod(currentPeriodStart, now),
      getDashboardMetricsForPeriod(previousPeriodStart, currentPeriodStart),
    ]);

    // Calculate comparisons
    const calculateComparison = (current: number, previous: number): PeriodComparison => {
      const change = current - previous;
      const percentageChange = previous === 0 
        ? (current > 0 ? 100 : 0)
        : ((current - previous) / previous) * 100;
      
      const trend: 'up' | 'down' | 'neutral' = 
        percentageChange > 0 ? 'up' : 
        percentageChange < 0 ? 'down' : 'neutral';

      const isSignificant = Math.abs(percentageChange) >= 5; // 5% threshold

      return {
        current,
        previous,
        change,
        percentageChange: Math.round(percentageChange * 10) / 10, // Round to 1 decimal
        trend,
        isSignificant,
        period: `${currentPeriodDays} days`,
      };
    };

    const comparisons = {
      totalStudents: calculateComparison(
        currentPeriodMetrics.totalStudents,
        previousPeriodMetrics.totalStudents
      ),
      newRegistrations: calculateComparison(
        currentPeriodMetrics.publicRegistrations + currentPeriodMetrics.adminRegistrations,
        previousPeriodMetrics.publicRegistrations + previousPeriodMetrics.adminRegistrations
      ),
      qrGenerated: calculateComparison(
        currentPeriodMetrics.qrCodesGenerated,
        previousPeriodMetrics.qrCodesGenerated
      ),
    };

    return {
      metrics: currentMetrics,
      comparisons,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching comprehensive dashboard data:', error);
    throw new Error('Failed to fetch comprehensive dashboard data');
  }
}

/**
 * Get recent registration activity (last 7 days by day)
 * @returns Promise<Array<{ date: string; count: number }>>
 */
export async function getRecentRegistrationActivity(): Promise<Array<{ date: string; count: number }>> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const registrations = await prisma.student.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const registrationsByDate = new Map<string, number>();
    
    // Initialize all dates with 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      registrationsByDate.set(dateStr, 0);
    }

    // Count registrations by date
    registrations.forEach((registration) => {
      const dateStr = registration.createdAt.toISOString().split('T')[0];
      const currentCount = registrationsByDate.get(dateStr) || 0;
      registrationsByDate.set(dateStr, currentCount + 1);
    });

    // Convert to array format
    return Array.from(registrationsByDate.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  } catch (error) {
    console.error('Error fetching recent registration activity:', error);
    throw new Error('Failed to fetch recent registration activity');
  }
}

/**
 * Get top programs by student count
 * @param limit - Maximum number of programs to return (default: 5)
 * @returns Promise<Array<{ programName: string; studentCount: number; percentage: number }>>
 */
export async function getTopProgramsByStudentCount(
  limit: number = 5
): Promise<Array<{ programName: string; studentCount: number; percentage: number }>> {
  try {
    const [programStats, totalStudents] = await Promise.all([
      prisma.program.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: {
          students: {
            _count: 'desc',
          },
        },
        take: limit,
      }),
      prisma.student.count(),
    ]);

    return programStats.map((program) => ({
      programName: program.name,
      studentCount: program._count.students,
      percentage: totalStudents > 0 
        ? Math.round((program._count.students / totalStudents) * 100 * 10) / 10
        : 0,
    }));
  } catch (error) {
    console.error('Error fetching top programs by student count:', error);
    throw new Error('Failed to fetch top programs by student count');
  }
}
