"use client";

import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { RecentActivityFeed, RecentActivityFeedProps } from './RecentActivityFeed';
import type { ActivityWithRelations, ActivityFilter } from '@/lib/types/activity';

type UseActivityDataProps = {
  initialLimit?: number;
  initialFilter?: Partial<ActivityFilter>;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
};

function useActivityData({
  initialLimit = 10,
  initialFilter = {},
  autoRefresh = true,
  refreshInterval = 15000, // 15 seconds
}: UseActivityDataProps) {
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState<number>(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [filters] = useState(initialFilter);

  const buildQueryString = useCallback((currentOffset: number = 0) => {
    const params = new URLSearchParams({ 
      limit: String(initialLimit),
      offset: String(currentOffset)
    });
    if (filters.severity) {
      if (Array.isArray(filters.severity)) {
        params.set('severity', filters.severity.join(','));
      } else {
        params.set('severity', filters.severity);
      }
    }
    if (filters.category) {
      if (Array.isArray(filters.category)) {
        params.set('category', filters.category.join(','));
      } else {
        params.set('category', filters.category);
      }
    }
    // Add other filters as needed
    return params.toString();
  }, [initialLimit, filters]);

  const fetchActivities = useCallback(async (
    currentOffset: number = 0,
    isInitialLoad = false
  ) => {
    if (isInitialLoad) setIsLoading(true);
    else setIsFetchingMore(true);
    setError(null);

    try {
      const queryString = buildQueryString(currentOffset);
      const response = await fetch(`/api/admin/activity?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      const newActivities: ActivityWithRelations[] = await response.json();
      
      setActivities(prev => (currentOffset > 0 ? [...prev, ...newActivities] : newActivities));
      setHasMore(newActivities.length === initialLimit);
      if (currentOffset === 0) {
        setOffset(newActivities.length);
      } else {
        setOffset(prev => prev + newActivities.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      if (isInitialLoad) setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [buildQueryString, initialLimit]);

  // Initial fetch
  useEffect(() => {
    fetchActivities(0, true);
  }, [fetchActivities, filters]); // Refetch when filters change

  // Polling for new activities
  useEffect(() => {
    if (!autoRefresh) return;
    const intervalId = setInterval(() => {
      // This simple poll refetches the first page.
      // A more sophisticated implementation might check for new items since last fetch.
      fetchActivities(0, false);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchActivities]);

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      fetchActivities(offset, false);
    }
  };

  return { activities, isLoading, error, hasMore, loadMore };
}


type ActivityFeedContainerProps = Partial<RecentActivityFeedProps> & {
  containerClassName?: string;
  variant?: 'compact' | 'full';
};

export function ActivityFeedContainer({
  containerClassName,
  variant = 'full',
  ...feedProps
}: ActivityFeedContainerProps) {
  const { activities, isLoading, error, hasMore, loadMore } = useActivityData({
    initialLimit: variant === 'compact' ? 7 : 20,
    autoRefresh: true,
  });


  
  return (
    <div className={containerClassName}>
      <RecentActivityFeed
        activities={activities}
        loading={isLoading}
        error={error || undefined}
        hasMore={hasMore}
        onLoadMore={loadMore}
        showFilters={variant === 'full'}
        {...feedProps}
      />
    </div>
  );
}

export function CompactActivityFeed() {
  return (
    <ActivityFeedContainer
      variant="compact"
      containerClassName="rounded-lg border bg-card"
    />
  );
}
