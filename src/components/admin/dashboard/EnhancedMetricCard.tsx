'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Enhanced metric card variants using CVA
const metricCardVariants = cva(
  "transition-all duration-200 hover:shadow-lg",
  {
    variants: {
      trend: {
        up: "border-l-4 border-l-green-500",
        down: "border-l-4 border-l-red-500",
        neutral: "border-l-4 border-l-gray-400",
      },
      size: {
        default: "p-6",
        compact: "p-4",
      }
    },
    defaultVariants: {
      trend: "neutral",
      size: "default",
    },
  }
);

const trendVariants = cva(
  "inline-flex items-center gap-1 text-sm font-medium",
  {
    variants: {
      trend: {
        up: "text-green-600",
        down: "text-red-600",
        neutral: "text-gray-500",
      }
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

export interface EnhancedMetricCardProps extends VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentageChange?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  description?: string;
  period?: string;
  isLoading?: boolean;
  className?: string;
}

export function EnhancedMetricCard({
  title,
  value,
  previousValue,
  percentageChange,
  trend = 'neutral',
  icon: Icon,
  description,
  period = 'vs last month',
  isLoading = false,
  size,
  className,
}: EnhancedMetricCardProps) {
  // Determine trend icon based on trend prop
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  // Format percentage change display
  const formatPercentageChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn(metricCardVariants({ trend: 'neutral', size }), className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </CardTitle>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(metricCardVariants({ trend, size }), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Main metric value */}
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {/* Trend indicator and percentage change */}
          {percentageChange !== undefined && (
            <div className={cn(trendVariants({ trend }))}>
              <TrendIcon className="h-3 w-3" />
              <span>{formatPercentageChange(percentageChange)}</span>
              <span className="text-xs text-muted-foreground ml-1">
                {period}
              </span>
            </div>
          )}
          
          {/* Previous value comparison */}
          {previousValue !== undefined && percentageChange === undefined && (
            <p className="text-xs text-muted-foreground">
              Previous: {typeof previousValue === 'number' ? previousValue.toLocaleString() : previousValue}
            </p>
          )}
          
          {/* Optional description */}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedMetricCard;
