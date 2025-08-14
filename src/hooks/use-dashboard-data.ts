'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  DashboardData, 
  DisplayMetric, 
  DashboardFilters, 
  TrendDirection 
} from '@/lib/types/dashboard';
import { 
  getCurrentDashboardMetrics, 
  getComprehensiveDashboardData 
} from '@/lib/db/queries/dashboard';

// Hook configuration interface
interface UseDashboardDataConfig {
  pollingInterval?: number; // Polling interval in milliseconds (default: 30000 = 30 seconds)
  enablePolling?: boolean; // Enable automatic polling (default: true)
  retryAttempts?: number; // Number of retry attempts on failure (default: 3)
  retryDelay?: number; // Delay between retries in milliseconds (default: 1000)
  onError?: (error: Error) => void; // Error callback
  onSuccess?: (data: DashboardData) => void; // Success callback
}

// Hook return interface
interface UseDashboardDataReturn {
  // Data
  data: DashboardData | null;
  metrics: DisplayMetric[];
  
  // State
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Controls
  refresh: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
  
  // Configuration
  setPollingInterval: (interval: number) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  filters: DashboardFilters;
}

// Default configuration
const DEFAULT_CONFIG: Required<UseDashboardDataConfig> = {
  pollingInterval: 30000, // 30 seconds
  enablePolling: true,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  onError: () => {},
  onSuccess: () => {},
};

// Default filters
const DEFAULT_FILTERS: DashboardFilters = {
  period: '30d',
  programIds: undefined,
  registrationSource: undefined,
  dateRange: undefined,
};

/**
 * Custom hook for dashboard data management with polling and real-time updates
 * Provides comprehensive dashboard data with automatic refresh capabilities
 */
export function useDashboardData(config: UseDashboardDataConfig = {}): UseDashboardDataReturn {
  // Merge config with defaults
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // State management
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [filters, setFiltersState] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [pollingInterval, setPollingIntervalState] = useState<number>(finalConfig.pollingInterval);
  
  // Refs for cleanup and polling control
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);
  const retryCountRef = useRef<number>(0);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Convert raw metrics to display metrics
  const convertToDisplayMetrics = useCallback((dashboardData: DashboardData): DisplayMetric[] => {
    const { metrics, comparisons } = dashboardData;
    
    const displayMetrics: DisplayMetric[] = [
      {
        id: 'total-students',
        title: 'Total Students',
        value: metrics.totalStudents,
        previousValue: comparisons.totalStudents.previous,
        percentageChange: comparisons.totalStudents.percentageChange,
        trend: comparisons.totalStudents.trend,
        iconName: 'users',
        description: 'Total registered students across all programs',
        period: 'vs last period',
        isSignificant: comparisons.totalStudents.isSignificant,
      },
      {
        id: 'new-registrations',
        title: 'New Registrations',
        value: metrics.publicRegistrations + metrics.adminRegistrations,
        previousValue: comparisons.newRegistrations.previous,
        percentageChange: comparisons.newRegistrations.percentageChange,
        trend: comparisons.newRegistrations.trend,
        iconName: 'user-plus',
        description: `${metrics.publicRegistrations} public, ${metrics.adminRegistrations} admin registrations`,
        period: 'this period',
        isSignificant: comparisons.newRegistrations.isSignificant,
      },
      {
        id: 'qr-generated',
        title: 'QR Codes Generated',
        value: metrics.qrCodesGenerated,
        previousValue: comparisons.qrGenerated.previous,
        percentageChange: comparisons.qrGenerated.percentageChange,
        trend: comparisons.qrGenerated.trend,
        iconName: 'qr-code',
        description: 'QR codes generated for student identification',
        period: 'vs last period',
        isSignificant: comparisons.qrGenerated.isSignificant,
      },
      {
        id: 'active-programs',
        title: 'Active Programs',
        value: metrics.activePrograms,
        previousValue: metrics.totalPrograms,
        percentageChange: 0, // Programs don't change frequently
        trend: 'neutral' as TrendDirection,
        iconName: 'bar-chart-3',
        description: `${metrics.activePrograms} of ${metrics.totalPrograms} programs have enrolled students`,
        period: 'total available',
        isSignificant: false,
      },
    ];

    return displayMetrics;
  }, []);

  // Fetch dashboard data with error handling and retries
  const fetchDashboardData = useCallback(async (retryCount: number = 0): Promise<void> => {
    try {
      setError(null);
      
      // Don't set loading to true if this is a background refresh (polling)
      if (!isPolling || retryCount === 0) {
        setLoading(true);
      }

      // Determine period in days based on filter
      const periodDays = filters.period === '7d' ? 7 : 
                        filters.period === '30d' ? 30 :
                        filters.period === '90d' ? 90 :
                        filters.period === '1y' ? 365 : 30;

      // Fetch comprehensive dashboard data
      const dashboardData = await getComprehensiveDashboardData(periodDays);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setData(dashboardData);
        setLastUpdated(new Date());
        setLoading(false);
        retryCountRef.current = 0; // Reset retry count on success
        
        // Call success callback
        finalConfig.onSuccess(dashboardData);
      }
      
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        // If we have retries left, attempt retry
        if (retryCount < finalConfig.retryAttempts) {
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              fetchDashboardData(retryCount + 1);
            }
          }, finalConfig.retryDelay * (retryCount + 1)); // Exponential backoff
          return;
        }
        
        // No more retries, set error state
        setError(errorMessage);
        setLoading(false);
        retryCountRef.current = 0;
        
        // Call error callback
        finalConfig.onError(new Error(errorMessage));
      }
    }
  }, [filters.period, finalConfig, isPolling]);

  // Manual refresh function
  const refresh = useCallback(async (): Promise<void> => {
    await fetchDashboardData(0);
  }, [fetchDashboardData]);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPolling) return; // Already polling
    
    setIsPolling(true);
    
    const poll = () => {
      if (mountedRef.current && isPolling) {
        fetchDashboardData(0).finally(() => {
          if (mountedRef.current && isPolling) {
            pollingTimeoutRef.current = setTimeout(poll, pollingInterval);
          }
        });
      }
    };
    
    // Start polling after the interval
    pollingTimeoutRef.current = setTimeout(poll, pollingInterval);
  }, [fetchDashboardData, pollingInterval, isPolling]);

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    cleanup();
  }, [cleanup]);

  // Set polling interval
  const setPollingInterval = useCallback((interval: number) => {
    setPollingIntervalState(interval);
    
    // If currently polling, restart with new interval
    if (isPolling) {
      stopPolling();
      // Use setTimeout to ensure state update is processed
      setTimeout(() => {
        startPolling();
      }, 0);
    }
  }, [isPolling, startPolling, stopPolling]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(0);
  }, [fetchDashboardData]);

  // Auto-start polling if enabled
  useEffect(() => {
    if (finalConfig.enablePolling && !isPolling) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [finalConfig.enablePolling, startPolling, stopPolling, isPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Convert data to display metrics
  const metrics = data ? convertToDisplayMetrics(data) : [];

  return {
    // Data
    data,
    metrics,
    
    // State
    loading,
    error,
    lastUpdated,
    
    // Controls
    refresh,
    startPolling,
    stopPolling,
    isPolling,
    
    // Configuration
    setPollingInterval,
    setFilters,
    filters,
  };
}

// Utility hook for simplified dashboard metrics (without polling)
export function useSimpleDashboardMetrics() {
  const [metrics, setMetrics] = useState<DisplayMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rawMetrics = await getCurrentDashboardMetrics();
      
      // Convert to display metrics with basic trend calculation
      const displayMetrics: DisplayMetric[] = [
        {
          id: 'total-students',
          title: 'Total Students',
          value: rawMetrics.totalStudents,
          trend: 'neutral' as TrendDirection,
          iconName: 'users',
          description: 'Total registered students',
        },
        {
          id: 'total-programs',
          title: 'Total Programs',
          value: rawMetrics.totalPrograms,
          trend: 'neutral' as TrendDirection,
          iconName: 'bar-chart-3',
          description: 'Available academic programs',
        },
        {
          id: 'new-registrations',
          title: 'New Registrations',
          value: rawMetrics.publicRegistrations + rawMetrics.adminRegistrations,
          trend: rawMetrics.publicRegistrations > 0 ? 'up' : 'neutral',
          iconName: 'user-plus',
          description: 'Recent student registrations',
        },
        {
          id: 'qr-generated',
          title: 'QR Codes',
          value: rawMetrics.qrCodesGenerated,
          trend: 'neutral' as TrendDirection,
          iconName: 'qr-code',
          description: 'Generated QR codes',
        },
      ];
      
      setMetrics(displayMetrics);
      setLoading(false);
    } catch (err) {
      console.error('Simple metrics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics,
  };
}

export default useDashboardData;
