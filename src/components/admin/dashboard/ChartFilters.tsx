'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export type TimePeriod = '7d' | '30d' | '90d';

interface ChartFiltersProps {
  activePeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const filterOptions: { label: string; value: TimePeriod }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

const ChartFilters: React.FC<ChartFiltersProps> = ({
  activePeriod,
  onPeriodChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 max-w-full">
      {filterOptions.map(option => (
        <Button
          key={option.value}
          variant={activePeriod === option.value ? 'default' : 'outline'}
          size="sm"
          className="whitespace-nowrap"
          onClick={() => onPeriodChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ChartFilters;
