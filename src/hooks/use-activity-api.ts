'use client';

import { useState, useEffect, useCallback } from 'react';

// Simplified activity interface for API responses
interface ActivityApiResponse {
  id: string;
  type: string;
  action: string;
  description: string;
  severity: string;
  category: string;
  source: string;
  createdAt: string;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  admin?: {
    email: string;
  } | null;
  program?: {
    name: string;
  } | null;
}

interface UseActivityApiOptions {
  limit?: number;
  pollingInterval?: number;
  enablePolling?: boolean;
}

interface UseActivityApiReturn {
  activities: ActivityApiResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useActivityApi(options: UseActivityApiOptions = {}): UseActivityApiReturn {
  const {
    limit = 10,
    pollingInterval = 30000, // 30 seconds
    enablePolling = true
  } = options;

  const [activities, setActivities] = useState<ActivityApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch(`/api/admin/activity?limit=${limit}`, {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setActivities(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      setLoading(false);
    }
  }, [limit]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchActivities();
  }, [fetchActivities]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Polling
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(fetchActivities, pollingInterval);
    
    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, fetchActivities]);

  return {
    activities,
    loading,
    error,
    refresh,
  };
}

export default useActivityApi;
