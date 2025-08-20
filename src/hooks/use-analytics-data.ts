'use client';

import useSWR from 'swr';
import { TimePeriod } from '@/components/admin/dashboard/ChartFilters';
import { RegistrationTrendData } from '@/lib/utils/chart-data';
import { ProgramDistributionData } from '@/lib/db/queries/analytics';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useRegistrationTrends = (period: TimePeriod) => {
  const { data, error, isLoading } = useSWR<RegistrationTrendData[]>(
    `/api/admin/analytics/trends?period=${period}`,
    fetcher,
  );

  return {
    data,
    isLoading,
    error,
  };
};

export const useProgramDistribution = () => {
  const { data, error, isLoading } = useSWR<ProgramDistributionData[]>(
    '/api/admin/analytics/distribution',
    fetcher,
  );

  return {
    data,
    isLoading,
    error,
  };
};
