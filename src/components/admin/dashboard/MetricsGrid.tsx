'use client';

import React, { Suspense } from 'react';
import { EnhancedMetricCard } from './EnhancedMetricCard';
import { Users, UserPlus, QrCode, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Error boundary component for individual metrics
class MetricErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MetricCard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Failed to load metric</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton for metrics grid
const MetricsGridSkeleton: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <EnhancedMetricCard
        key={index}
        title=""
        value=""
        icon={Users}
        isLoading={true}
      />
    ))}
  </div>
);

// Individual metric data interface
export interface MetricData {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  percentageChange?: number;
  trend?: 'up' | 'down' | 'neutral';
  iconName: 'users' | 'user-plus' | 'qr-code' | 'trending-up' | 'bar-chart-3' | 'activity';
  description?: string;
  period?: string;
}

// Props interface for MetricsGrid
export interface MetricsGridProps {
  metrics?: MetricData[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  onMetricClick?: (metric: MetricData) => void;
}

// Icon mapping for client-side rendering
const iconMap = {
  'users': Users,
  'user-plus': UserPlus,
  'qr-code': QrCode,
  'trending-up': TrendingUp,
  'bar-chart-3': BarChart3,
  'activity': TrendingUp, // Using TrendingUp as fallback for Activity
} as const;

// Default metrics configuration
const defaultMetrics: MetricData[] = [
  {
    id: 'total-students',
    title: 'Total Students',
    value: 0,
    previousValue: 0,
    percentageChange: 0,
    trend: 'neutral',
    iconName: 'users',
    description: 'Total registered students',
    period: 'vs last month',
  },
  {
    id: 'new-registrations',
    title: 'New Registrations',
    value: 0,
    previousValue: 0,
    percentageChange: 0,
    trend: 'neutral',
    iconName: 'user-plus',
    description: 'Students registered this month',
    period: 'vs last month',
  },
  {
    id: 'qr-generated',
    title: 'QR Codes Generated',
    value: 0,
    previousValue: 0,
    percentageChange: 0,
    trend: 'neutral',
    iconName: 'qr-code',
    description: 'QR codes generated this month',
    period: 'vs last month',
  },
  {
    id: 'growth-rate',
    title: 'Growth Rate',
    value: '0%',
    previousValue: '0%',
    percentageChange: 0,
    trend: 'neutral',
    iconName: 'trending-up',
    description: 'Monthly registration growth',
    period: 'vs last month',
  },
];

export function MetricsGrid({
  metrics = defaultMetrics,
  isLoading = false,
  error = null,
  className,
  columns = {
    md: 2,
    lg: 4,
  },
  onMetricClick,
}: MetricsGridProps) {
  // Generate responsive grid classes based on columns prop
  const gridClasses = cn(
    'grid gap-6',
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    // Default responsive classes if no columns specified
    !columns.sm && !columns.md && !columns.lg && !columns.xl && 'md:grid-cols-2 lg:grid-cols-4'
  );

  // Error state
  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Failed to Load Metrics</h3>
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(className)}>
        <Suspense fallback={<MetricsGridSkeleton />}>
          <MetricsGridSkeleton />
        </Suspense>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <div className={gridClasses}>
        {metrics.map((metric) => {
          const IconComponent = iconMap[metric.iconName] || Users; // Fallback to Users icon
          
          const handleClick = () => {
            if (onMetricClick) {
              onMetricClick(metric);
            } else {
              // Default behavior - could log or do nothing
              console.log('Metric clicked:', metric.id);
            }
          };
          
          return (
            <MetricErrorBoundary key={metric.id}>
              <div
                className={cn(
                  'transition-transform duration-200',
                  'cursor-pointer hover:translate-y-[-2px]'
                )}
                onClick={handleClick}
              >
                <EnhancedMetricCard
                  title={metric.title}
                  value={metric.value}
                  previousValue={metric.previousValue}
                  percentageChange={metric.percentageChange}
                  trend={metric.trend}
                  icon={IconComponent}
                  description={metric.description}
                  period={metric.period}
                />
              </div>
            </MetricErrorBoundary>
          );
        })}
      </div>
      
      {/* Empty state */}
      {metrics.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Metrics Available</h3>
          <p className="text-gray-600">Metrics will appear here once data is available.</p>
        </div>
      )}
    </div>
  );
}

// Export individual components for flexibility
export { MetricErrorBoundary, MetricsGridSkeleton };
export default MetricsGrid;
