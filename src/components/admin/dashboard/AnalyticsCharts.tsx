'use client';

import React, { useState } from 'react';
import {
  useRegistrationTrends,
  useProgramDistribution,
} from '@/hooks/use-analytics-data';
import RegistrationTrendsChart from './RegistrationTrendsChart';
import ProgramDistributionChart from './ProgramDistributionChart';
import ChartFilters, { TimePeriod } from './ChartFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsCharts = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d'); // Changed default to match screenshot
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useRegistrationTrends(timePeriod);
  const {
    data: distributionData,
    isLoading: distributionLoading,
    error: distributionError,
  } = useProgramDistribution();

  // Debug logging
  console.log('AnalyticsCharts Debug:', {
    timePeriod,
    trendsData,
    trendsLoading,
    trendsError,
    dataLength: trendsData?.length,
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Registration Trends</CardTitle>
          <ChartFilters
            activePeriod={timePeriod}
            onPeriodChange={setTimePeriod}
          />
        </CardHeader>
        <CardContent className="pt-0">
          {trendsLoading && <p>Loading...</p>}
          {trendsError && <p>Error loading trends data: {JSON.stringify(trendsError)}</p>}
          {trendsData && trendsData.length > 0 ? (
            <RegistrationTrendsChart data={trendsData} />
          ) : (
            !trendsLoading && !trendsError && <p>No data available for the selected period.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Program Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {distributionLoading && <p>Loading...</p>}
          {distributionError && <p>Error loading distribution data.</p>}
          {distributionData && (
            <ProgramDistributionChart data={distributionData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
