'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  ActivityWithRelations, 
  ActivityFilter,
  getRecentActivities 
} from '@/lib/db/queries/activity';

// Hook configuration interface
interface UseRealTimeActivityConfig {
  pollingInterval?: number; // Polling interval in milliseconds (default: 10000 = 10 seconds)
  maxActivities?: number; // Maximum number of activities to keep in memory (default: 100)
  enablePolling?: boolean; // Enable automatic polling (default: true)
  retryAttempts?: number; // Number of retry attempts on failure (default: 3)
  retryDelay?: number; // Delay between retries in milliseconds (default: 1000)
  onNewActivity?: (activity: ActivityWithRelations) => void; // Callback for new activities
  onError?: (error: Error) => void; // Error callback
  onConnectionChange?: (connected: boolean) => void; // Connection status callback
  filter?: Partial<ActivityFilter>; // Filter for activities
}

// Hook return interface
interface UseRealTimeActivityReturn {
  // Data
  activities: ActivityWithRelations[];
  latestActivity: ActivityWithRelations | null;
  newActivitiesCount: number;
  
  // State
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdated: Date | null;
  
  // Controls
  refresh: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  markAsRead: () => void;
  clearActivities: () => void;
  
  // Configuration
  setPollingInterval: (interval: number) => void;
  setFilter: (filter: Partial<ActivityFilter>) => void;
  filter: ActivityFilter;
  isPolling: boolean;
}

// Default configuration
const DEFAULT_CONFIG: Required<UseRealTimeActivityConfig> = {
  pollingInterval: 10000, // 10 seconds
  maxActivities: 100,
  enablePolling: true,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  onNewActivity: () => {},
  onError: () => {},
  onConnectionChange: () => {},
  filter: {},
};

// Default filter
const DEFAULT_FILTER: ActivityFilter = {
  limit: 50,
};

/**
 * Custom hook for real-time activity updates with WebSocket-like polling
 * Provides live activity updates with connection management and error handling
 */
export function useRealTimeActivity(config: UseRealTimeActivityConfig = {}): UseRealTimeActivityReturn {
  // Merge config with defaults
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  
  // State management
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [latestActivity, setLatestActivity] = useState<ActivityWithRelations | null>(null);
  const [newActivitiesCount, setNewActivitiesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [filter, setFilterState] = useState<ActivityFilter>({ ...DEFAULT_FILTER, ...finalConfig.filter });
  const [pollingInterval, setPollingIntervalState] = useState<number>(finalConfig.pollingInterval);
  
  // Refs for cleanup and polling control
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);
  const retryCountRef = useRef<number>(0);
  const lastActivityIdRef = useRef<string | null>(null);

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

  // Detect new activities by comparing with last known activity
  const detectNewActivities = useCallback((
    newActivities: ActivityWithRelations[], 
    existingActivities: ActivityWithRelations[]
  ): ActivityWithRelations[] => {
    if (existingActivities.length === 0) {
      return []; // Don't treat initial load as "new"
    }

    const lastKnownId = existingActivities[0]?.id;
    if (!lastKnownId) return newActivities;

    const newActivityIndex = newActivities.findIndex(activity => activity.id === lastKnownId);
    
    if (newActivityIndex === -1) {
      // All activities are new (shouldn't happen with proper pagination)
      return newActivities.slice(0, 5); // Limit to prevent overwhelming
    }
    
    return newActivities.slice(0, newActivityIndex);
  }, []);

  // Merge new activities with existing ones
  const mergeActivities = useCallback((
    newActivities: ActivityWithRelations[], 
    existingActivities: ActivityWithRelations[]
  ): ActivityWithRelations[] => {
    const merged = [...newActivities, ...existingActivities];
    
    // Remove duplicates based on ID
    const unique = merged.filter((activity, index, self) => 
      index === self.findIndex(a => a.id === activity.id)
    );
    
    // Sort by creation date (newest first)
    unique.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Limit to maxActivities
    return unique.slice(0, finalConfig.maxActivities);
  }, [finalConfig.maxActivities]);

  // Fetch activities with retry logic
  const fetchActivities = useCallback(async (retryCount: number = 0): Promise<void> => {
    try {
      setError(null);
      
      // Only set loading on initial fetch or after error
      if (activities.length === 0 || retryCount === 0) {
        setLoading(true);
      }

      // Fetch recent activities
      const fetchedActivities = await getRecentActivities(filter);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        setActivities(prevActivities => {
          // Detect new activities
          const newActivities = detectNewActivities(fetchedActivities, prevActivities);
          
          // Update new activities count
          if (newActivities.length > 0) {
            setNewActivitiesCount(prev => prev + newActivities.length);
            setLatestActivity(newActivities[0]);
            
            // Call new activity callback for each new activity
            newActivities.forEach(activity => {
              finalConfig.onNewActivity(activity);
            });
          }
          
          // Merge activities
          return mergeActivities(fetchedActivities, prevActivities);
        });
        
        setLastUpdated(new Date());
        setLoading(false);
        setConnected(true);
        retryCountRef.current = 0; // Reset retry count on success
        
        // Update connection status
        finalConfig.onConnectionChange(true);
      }
      
    } catch (err) {
      console.error('Real-time activity fetch error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        // If we have retries left, attempt retry
        if (retryCount < finalConfig.retryAttempts) {
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              fetchActivities(retryCount + 1);
            }
          }, finalConfig.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
          return;
        }
        
        // No more retries, set error state
        setError(errorMessage);
        setLoading(false);
        setConnected(false);
        retryCountRef.current = 0;
        
        // Update connection status and call error callback
        finalConfig.onConnectionChange(false);
        finalConfig.onError(new Error(errorMessage));
      }
    }
  }, [activities, filter, finalConfig, detectNewActivities, mergeActivities]);

  // Manual refresh function
  const refresh = useCallback(async (): Promise<void> => {
    await fetchActivities(0);
  }, [fetchActivities]);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPolling) return; // Already polling
    
    setIsPolling(true);
    
    const poll = () => {
      if (mountedRef.current && isPolling) {
        fetchActivities(0).finally(() => {
          if (mountedRef.current && isPolling) {
            pollingTimeoutRef.current = setTimeout(poll, pollingInterval);
          }
        });
      }
    };
    
    // Start polling immediately
    poll();
  }, [fetchActivities, pollingInterval, isPolling]);

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    setConnected(false);
    cleanup();
    finalConfig.onConnectionChange(false);
  }, [cleanup, finalConfig]);

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

  // Mark activities as read
  const markAsRead = useCallback(() => {
    setNewActivitiesCount(0);
  }, []);

  // Clear all activities
  const clearActivities = useCallback(() => {
    setActivities([]);
    setLatestActivity(null);
    setNewActivitiesCount(0);
    setLastUpdated(null);
    lastActivityIdRef.current = null;
  }, []);

  // Set filter
  const setFilter = useCallback((newFilter: Partial<ActivityFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchActivities(0);
  }, [fetchActivities]);

  // Auto-start polling if enabled
  useEffect(() => {
    if (finalConfig.enablePolling && !isPolling) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [finalConfig.enablePolling, startPolling, stopPolling, isPolling]);

  // Handle filter changes
  useEffect(() => {
    if (isPolling) {
      // Restart polling with new filter
      fetchActivities(0);
    }
  }, [filter, fetchActivities, isPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Visibility change handling (pause/resume when tab is hidden/visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, stop polling to save resources
        if (isPolling) {
          stopPolling();
        }
      } else {
        // Tab is visible, resume polling if it was enabled
        if (finalConfig.enablePolling && !isPolling) {
          startPolling();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [finalConfig.enablePolling, isPolling, startPolling, stopPolling]);

  return {
    // Data
    activities,
    latestActivity,
    newActivitiesCount,
    
    // State
    loading,
    error,
    connected,
    lastUpdated,
    
    // Controls
    refresh,
    startPolling,
    stopPolling,
    markAsRead,
    clearActivities,
    
    // Configuration
    setPollingInterval,
    setFilter,
    filter,
    isPolling,
  };
}

// Utility hook for activity notifications
export function useActivityNotifications(config: UseRealTimeActivityConfig = {}) {
  const [notifications, setNotifications] = useState<ActivityWithRelations[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const activityHook = useRealTimeActivity({
    ...config,
    onNewActivity: (activity) => {
      // Add to notifications
      setNotifications(prev => [activity, ...prev.slice(0, 9)]); // Keep last 10
      setUnreadCount(prev => prev + 1);
      
      // Call original callback if provided
      if (config.onNewActivity) {
        config.onNewActivity(activity);
      }
    },
  });

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const markNotificationAsRead = useCallback((activityId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== activityId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    ...activityHook,
    notifications,
    unreadCount,
    clearNotifications,
    markNotificationAsRead,
  };
}

// Specialized hook for security activities
export function useSecurityActivityMonitor(config: UseRealTimeActivityConfig = {}) {
  return useRealTimeActivity({
    ...config,
    pollingInterval: 5000, // More frequent polling for security
    filter: {
      severity: ['warning', 'error', 'critical'],
      category: ['security', 'authentication'],
      ...config.filter,
    },
  });
}

// Specialized hook for registration activities
export function useRegistrationActivityMonitor(config: UseRealTimeActivityConfig = {}) {
  return useRealTimeActivity({
    ...config,
    filter: {
      type: ['student_registration'],
      category: ['registration'],
      ...config.filter,
    },
  });
}

export default useRealTimeActivity;
