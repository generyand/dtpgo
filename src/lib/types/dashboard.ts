/**
 * TypeScript type definitions for dashboard metrics, trends, and dashboard data
 * Complete type definitions for the admin dashboard system
 */



// ============================================================================
// BASE METRIC TYPES
// ============================================================================

/**
 * Trend direction for metrics
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Severity levels for growth indicators
 */
export type SeverityLevel = 'low' | 'medium' | 'high';

/**
 * Performance status indicators
 */
export type PerformanceStatus = 'excellent' | 'good' | 'warning' | 'critical';

/**
 * Time period options for analytics
 */
export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

/**
 * Registration source types
 */
export type RegistrationSource = 'public' | 'admin';

// ============================================================================
// CORE DASHBOARD INTERFACES
// ============================================================================

/**
 * Basic metric data structure
 */
export interface BaseMetric {
  id: string;
  title: string;
  value: number | string;
  description?: string;
  timestamp?: Date;
}

/**
 * Enhanced metric with trend information
 */
export interface MetricWithTrend extends BaseMetric {
  previousValue?: number | string;
  percentageChange?: number;
  trend: TrendDirection;
  period?: string;
  isSignificant?: boolean;
}

/**
 * Metric data for display components
 */
export interface DisplayMetric extends MetricWithTrend {
  iconName: 'users' | 'user-plus' | 'qr-code' | 'trending-up' | 'bar-chart-3' | 'activity';
  color?: string;
  unit?: string;
  formatType?: 'number' | 'percentage' | 'currency' | 'duration';
}

// ============================================================================
// DASHBOARD DATA STRUCTURES
// ============================================================================

/**
 * Core dashboard metrics
 */
export interface DashboardMetrics {
  totalStudents: number;
  totalPrograms: number;
  publicRegistrations: number;
  adminRegistrations: number;
  qrCodesGenerated: number;
  activePrograms: number;
  lastUpdated?: Date;
}

/**
 * Period comparison data
 */
export interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  percentageChange: number;
  trend: TrendDirection;
  isSignificant: boolean;
  period: string;
}

/**
 * Comprehensive dashboard data with comparisons
 */
export interface DashboardData {
  metrics: DashboardMetrics;
  comparisons: {
    totalStudents: PeriodComparison;
    newRegistrations: PeriodComparison;
    qrGenerated: PeriodComparison;
    programGrowth?: PeriodComparison;
  };
  lastUpdated: Date;
  refreshInterval?: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Time series data point
 */
export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registration activity data
 */
export interface RegistrationActivity extends TimeSeriesPoint {
  source: RegistrationSource;
  programId?: string;
  programName?: string;
}

/**
 * Program statistics
 */
export interface ProgramStats {
  id: string;
  name: string;
  displayName: string;
  studentCount: number;
  percentage: number;
  trend?: TrendDirection;
  growthRate?: number;
}

/**
 * Analytics summary
 */
export interface AnalyticsSummary {
  totalRegistrations: number;
  registrationsBySource: Record<RegistrationSource, number>;
  topPrograms: ProgramStats[];
  recentActivity: RegistrationActivity[];
  trends: {
    dailyAverage: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
  };
}

// ============================================================================
// CHART AND VISUALIZATION TYPES
// ============================================================================

/**
 * Chart data configuration
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area';
  title: string;
  description?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  responsive?: boolean;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

/**
 * Complete chart data structure
 */
export interface ChartData {
  config: ChartConfig;
  datasets: ChartDataset[];
  loading?: boolean;
  error?: string;
  lastUpdated?: Date;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Metric card component props
 */
export interface MetricCardProps {
  metric: DisplayMetric;
  loading?: boolean;
  error?: string;
  onClick?: (metric: DisplayMetric) => void;
  className?: string;
  size?: 'default' | 'compact' | 'large';
}

/**
 * Metrics grid component props
 */
export interface MetricsGridProps {
  metrics: DisplayMetric[];
  loading?: boolean;
  error?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  onMetricClick?: (metric: DisplayMetric) => void;
  className?: string;
}

/**
 * Dashboard layout props
 */
export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/**
 * Dashboard API response
 */
export interface DashboardApiResponse extends ApiResponse<DashboardData> {
  cacheExpiry?: string;
  refreshToken?: string;
}

/**
 * Analytics API response
 */
export interface AnalyticsApiResponse extends ApiResponse<AnalyticsSummary> {
  period: TimePeriod;
  filters?: Record<string, unknown>;
}

// ============================================================================
// FILTER AND QUERY TYPES
// ============================================================================

/**
 * Dashboard filters
 */
export interface DashboardFilters {
  period: TimePeriod;
  programIds?: string[];
  registrationSource?: RegistrationSource[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Query parameters for dashboard data
 */
export interface DashboardQuery {
  filters: DashboardFilters;
  refresh?: boolean;
  includeComparisons?: boolean;
  includeAnalytics?: boolean;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

/**
 * Dashboard state
 */
export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  filters: DashboardFilters;
  lastFetch: Date | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

/**
 * Dashboard actions
 */
export type DashboardAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: DashboardData }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_AUTO_REFRESH'; payload: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'RESET' };

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Metric calculation options
 */
export interface MetricCalculationOptions {
  precision?: number;
  significanceThreshold?: number;
  comparisonPeriods?: number;
  includeProjections?: boolean;
}

/**
 * Trend analysis result
 */
export interface TrendAnalysis {
  direction: TrendDirection;
  strength: SeverityLevel;
  confidence: number;
  description: string;
  insights: string[];
  recommendations?: string[];
}

/**
 * Performance benchmark
 */
export interface PerformanceBenchmark {
  metric: string;
  target: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  status: PerformanceStatus;
  lastUpdated: Date;
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  refreshInterval: number;
  autoRefresh: boolean;
  defaultPeriod: TimePeriod;
  enableRealTime: boolean;
  maxDataPoints: number;
  cacheTimeout: number;
  theme: {
    colors: {
      primary: string;
      success: string;
      warning: string;
      danger: string;
      neutral: string;
    };
    charts: {
      defaultColors: string[];
      gridColor: string;
      textColor: string;
    };
  };
}

// ============================================================================
// EXPORT GROUPED TYPES
// ============================================================================

/**
 * All metric-related types
 */
export type MetricTypes = 
  | BaseMetric 
  | MetricWithTrend 
  | DisplayMetric 
  | DashboardMetrics;

/**
 * All comparison-related types
 */
export type ComparisonTypes = 
  | PeriodComparison 
  | TrendAnalysis 
  | PerformanceBenchmark;

/**
 * All chart-related types
 */
export type ChartTypes = 
  | ChartConfig 
  | ChartDataPoint 
  | ChartDataset 
  | ChartData;

/**
 * All API-related types
 */
export type ApiTypes = 
  | ApiResponse 
  | DashboardApiResponse 
  | AnalyticsApiResponse;

/**
 * All component prop types
 */
export type ComponentPropTypes = 
  | MetricCardProps 
  | MetricsGridProps 
  | DashboardLayoutProps;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for DisplayMetric
 */
export function isDisplayMetric(metric: unknown): metric is DisplayMetric {
  return (
    typeof metric === 'object' &&
    metric !== null &&
    typeof (metric as Record<string, unknown>).id === 'string' &&
    typeof (metric as Record<string, unknown>).title === 'string' &&
    (typeof (metric as Record<string, unknown>).value === 'number' || typeof (metric as Record<string, unknown>).value === 'string') &&
    typeof (metric as Record<string, unknown>).trend === 'string' &&
    ['up', 'down', 'neutral'].includes((metric as Record<string, unknown>).trend as string) &&
    typeof (metric as Record<string, unknown>).iconName === 'string'
  );
}

/**
 * Type guard for DashboardData
 */
export function isDashboardData(data: unknown): data is DashboardData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as Record<string, unknown>).metrics === 'object' &&
    typeof (data as Record<string, unknown>).comparisons === 'object' &&
    (data as Record<string, unknown>).lastUpdated instanceof Date
  );
}

/**
 * Type guard for ApiResponse
 */
export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof (response as Record<string, unknown>).success === 'boolean' &&
    typeof (response as Record<string, unknown>).timestamp === 'string'
  );
}
