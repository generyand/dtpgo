import { NextRequest, NextResponse } from 'next/server';
import { 
  getCurrentDashboardMetrics, 
  getComprehensiveDashboardData,
  getRecentRegistrationActivity,
  getTopProgramsByStudentCount
} from '@/lib/db/queries/dashboard';
import { 
  DashboardApiResponse, 
  DashboardData, 
  TimePeriod,
  AnalyticsSummary 
} from '@/lib/types/dashboard';

/**
 * Dashboard API endpoint for real-time data
 * GET /api/admin/dashboard
 * 
 * Query Parameters:
 * - period: '7d' | '30d' | '90d' | '1y' | 'all' (default: '30d')
 * - includeAnalytics: 'true' | 'false' (default: 'false')
 * - refresh: 'true' | 'false' (default: 'false') - bypass cache
 */

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map<string, { data: DashboardData | (DashboardData & { analytics: AnalyticsSummary }); timestamp: number }>();

/**
 * Generate cache key based on request parameters
 */
function generateCacheKey(period: TimePeriod, includeAnalytics: boolean): string {
  return `dashboard-${period}-${includeAnalytics}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Validate period parameter
 */
function validatePeriod(period: string | null): TimePeriod {
  const validPeriods: TimePeriod[] = ['7d', '30d', '90d', '1y', 'all'];
  return validPeriods.includes(period as TimePeriod) ? (period as TimePeriod) : '30d';
}

/**
 * Convert period to days
 */
function periodToDays(period: TimePeriod): number {
  switch (period) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1y': return 365;
    case 'all': return 365 * 10; // 10 years as "all time"
    default: return 30;
  }
}

/**
 * GET handler for dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period');
    const includeAnalyticsParam = searchParams.get('includeAnalytics');
    const refreshParam = searchParams.get('refresh');

    // Validate and set defaults
    const period = validatePeriod(periodParam);
    const includeAnalytics = includeAnalyticsParam === 'true';
    const refresh = refreshParam === 'true';

    // Generate cache key
    const cacheKey = generateCacheKey(period, includeAnalytics);

    // Check cache unless refresh is requested
    if (!refresh && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      if (isCacheValid(cached.timestamp)) {
        console.log(`Dashboard cache hit for key: ${cacheKey}`);
        
        const response: DashboardApiResponse = {
          success: true,
          data: cached.data,
          timestamp: new Date().toISOString(),
          cacheExpiry: new Date(cached.timestamp + CACHE_DURATION).toISOString(),
        };

        return NextResponse.json(response, {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=300', // 5 minutes
            'X-Cache-Status': 'HIT',
            'X-Cache-Key': cacheKey,
          },
        });
      } else {
        // Remove expired cache entry
        cache.delete(cacheKey);
      }
    }

    console.log(`Fetching fresh dashboard data for period: ${period}, analytics: ${includeAnalytics}`);

    // Convert period to days
    const periodDays = periodToDays(period);

    // Fetch dashboard data
    const dashboardDataPromise = getComprehensiveDashboardData(periodDays);
    
    // Conditionally fetch analytics data
    const analyticsPromises = includeAnalytics ? [
      getRecentRegistrationActivity(),
      getTopProgramsByStudentCount(5)
    ] : [];

    // Execute all queries in parallel
    const [dashboardData, ...analyticsResults] = await Promise.all([
      dashboardDataPromise,
      ...analyticsPromises
    ]);

    // Build response data
    let responseData: DashboardData | (DashboardData & { analytics: AnalyticsSummary }) = dashboardData;

    // Add analytics if requested
    if (includeAnalytics && analyticsResults.length === 2) {
      const [recentActivity, topPrograms] = analyticsResults as [
        Array<{ date: string; count: number }>,
        Array<{ programName: string; studentCount: number; percentage: number }>
      ];
      
      const analytics: AnalyticsSummary = {
        totalRegistrations: dashboardData.metrics.publicRegistrations + dashboardData.metrics.adminRegistrations,
        registrationsBySource: {
          public: dashboardData.metrics.publicRegistrations,
          admin: dashboardData.metrics.adminRegistrations,
        },
        topPrograms: topPrograms.map((program) => ({
          id: `program-${program.programName.toLowerCase().replace(/\s+/g, '-')}`,
          name: program.programName,
          displayName: program.programName,
          studentCount: program.studentCount,
          percentage: program.percentage,
          trend: program.percentage > 20 ? 'up' : program.percentage > 10 ? 'neutral' : 'down',
          growthRate: program.percentage,
        })),
        recentActivity: recentActivity.map((activity) => ({
          date: activity.date,
          value: activity.count,
          source: 'public', // Default source, would need more data to determine actual source
        })),
        trends: {
          dailyAverage: recentActivity.reduce((sum, day) => sum + day.count, 0) / Math.max(recentActivity.length, 1),
          weeklyGrowth: dashboardData.comparisons.newRegistrations.percentageChange,
          monthlyGrowth: dashboardData.comparisons.totalStudents.percentageChange,
        },
      };

      responseData = { ...dashboardData, analytics };
    }

    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    // Clean up old cache entries (simple cleanup)
    if (cache.size > 50) {
      const oldestKey = Array.from(cache.keys())[0];
      cache.delete(oldestKey);
    }

    // Build API response
    const apiResponse: DashboardApiResponse = {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
      cacheExpiry: new Date(Date.now() + CACHE_DURATION).toISOString(),
    };

    // Return successful response
    return NextResponse.json(apiResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'X-Cache-Status': 'MISS',
        'X-Cache-Key': cacheKey,
        'X-Data-Freshness': new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Dashboard API error:', error);

    // Determine error message and status
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('Database')) {
        statusCode = 503; // Service Unavailable
        errorMessage = 'Database service temporarily unavailable';
      } else if (error.message.includes('timeout')) {
        statusCode = 504; // Gateway Timeout
        errorMessage = 'Request timeout - please try again';
      } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        statusCode = 403; // Forbidden
        errorMessage = 'Insufficient permissions to access dashboard data';
      }
    }

    // Build error response
    const errorResponse: DashboardApiResponse = {
      success: false,
      error: errorMessage,
      message: 'Failed to fetch dashboard data',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Error-Type': error instanceof Error ? error.constructor.name : 'UnknownError',
      },
    });
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

/**
 * POST handler for cache invalidation (admin only)
 * POST /api/admin/dashboard with { action: 'invalidate-cache' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'invalidate-cache') {
      // Clear all dashboard cache
      cache.clear();
      
      console.log('Dashboard cache invalidated');
      
      return NextResponse.json({
        success: true,
        message: 'Dashboard cache invalidated successfully',
        timestamp: new Date().toISOString(),
      }, {
        status: 200,
      });
    }
    
    // Invalid action
    return NextResponse.json({
      success: false,
      error: 'Invalid action',
      message: 'Supported actions: invalidate-cache',
      timestamp: new Date().toISOString(),
    }, {
      status: 400,
    });

  } catch (error) {
    console.error('Dashboard POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Invalid request body',
      message: 'Request body must be valid JSON',
      timestamp: new Date().toISOString(),
    }, {
      status: 400,
    });
  }
}

/**
 * Health check endpoint
 * Can be used to verify API availability
 */
export async function HEAD() {
  try {
    // Quick health check - just verify we can connect to database
    await getCurrentDashboardMetrics();
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Health-Status': 'OK',
        'X-Service': 'Dashboard API',
        'X-Timestamp': new Date().toISOString(),
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Health-Status': 'ERROR',
        'X-Service': 'Dashboard API',
        'X-Error': error instanceof Error ? error.message : 'Unknown error',
        'X-Timestamp': new Date().toISOString(),
      },
    });
  }
}
