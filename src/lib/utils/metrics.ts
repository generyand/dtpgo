/**
 * Metrics calculation utilities
 * Pure TypeScript functions for trend calculation, percentage change, and growth indicators
 */

// Types for metric calculations
export interface TrendData {
  current: number;
  previous: number;
  change: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'neutral';
  isSignificant: boolean;
}

export interface GrowthIndicator {
  value: number;
  trend: 'up' | 'down' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface MetricThresholds {
  significantChange: number; // Minimum percentage change to be considered significant
  highGrowth: number; // Threshold for high growth classification
  mediumGrowth: number; // Threshold for medium growth classification
}

// Default thresholds for metric analysis
export const DEFAULT_THRESHOLDS: MetricThresholds = {
  significantChange: 5, // 5% change is considered significant
  highGrowth: 20, // 20%+ growth is high
  mediumGrowth: 10, // 10%+ growth is medium
};

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  const change = ((current - previous) / previous) * 100;
  return Math.round(change * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate absolute change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Absolute change
 */
export function calculateAbsoluteChange(current: number, previous: number): number {
  return current - previous;
}

/**
 * Determine trend direction based on percentage change
 * @param percentageChange - Percentage change value
 * @param threshold - Minimum change to be considered significant (default: 1%)
 * @returns Trend direction
 */
export function determineTrend(
  percentageChange: number, 
  threshold: number = 1
): 'up' | 'down' | 'neutral' {
  if (Math.abs(percentageChange) < threshold) {
    return 'neutral';
  }
  return percentageChange > 0 ? 'up' : 'down';
}

/**
 * Calculate comprehensive trend data
 * @param current - Current value
 * @param previous - Previous value
 * @param thresholds - Custom thresholds (optional)
 * @returns Complete trend analysis
 */
export function calculateTrendData(
  current: number,
  previous: number,
  thresholds: MetricThresholds = DEFAULT_THRESHOLDS
): TrendData {
  const change = calculateAbsoluteChange(current, previous);
  const percentageChange = calculatePercentageChange(current, previous);
  const trend = determineTrend(percentageChange, thresholds.significantChange);
  const isSignificant = Math.abs(percentageChange) >= thresholds.significantChange;

  return {
    current,
    previous,
    change,
    percentageChange,
    trend,
    isSignificant,
  };
}

/**
 * Generate growth indicator with severity classification
 * @param percentageChange - Percentage change value
 * @param thresholds - Custom thresholds (optional)
 * @returns Growth indicator with classification
 */
export function generateGrowthIndicator(
  percentageChange: number,
  thresholds: MetricThresholds = DEFAULT_THRESHOLDS
): GrowthIndicator {
  const absChange = Math.abs(percentageChange);
  const trend = determineTrend(percentageChange, thresholds.significantChange);
  
  let severity: 'low' | 'medium' | 'high';
  let description: string;

  if (absChange >= thresholds.highGrowth) {
    severity = 'high';
    description = trend === 'up' ? 'Strong growth' : 'Significant decline';
  } else if (absChange >= thresholds.mediumGrowth) {
    severity = 'medium';
    description = trend === 'up' ? 'Moderate growth' : 'Moderate decline';
  } else {
    severity = 'low';
    description = trend === 'neutral' ? 'Stable' : 
                  trend === 'up' ? 'Slight increase' : 'Slight decrease';
  }

  return {
    value: percentageChange,
    trend,
    severity,
    description,
  };
}

/**
 * Format percentage change for display
 * @param percentageChange - Percentage change value
 * @param showSign - Whether to show + sign for positive values (default: true)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentageChange(
  percentageChange: number,
  showSign: boolean = true,
  decimals: number = 1
): string {
  const sign = showSign && percentageChange > 0 ? '+' : '';
  return `${sign}${percentageChange.toFixed(decimals)}%`;
}

/**
 * Format numeric value for display with appropriate units
 * @param value - Numeric value
 * @param unit - Unit suffix (optional)
 * @returns Formatted string
 */
export function formatMetricValue(value: number, unit?: string): string {
  const formattedValue = value.toLocaleString();
  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

/**
 * Calculate moving average for trend smoothing
 * @param values - Array of numeric values
 * @param windowSize - Size of the moving average window (default: 3)
 * @returns Array of moving averages
 */
export function calculateMovingAverage(
  values: number[],
  windowSize: number = 3
): number[] {
  if (values.length < windowSize) {
    return values;
  }

  const movingAverages: number[] = [];
  
  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
    movingAverages.push(Math.round(average * 100) / 100); // Round to 2 decimal places
  }

  return movingAverages;
}

/**
 * Calculate compound growth rate
 * @param initialValue - Starting value
 * @param finalValue - Ending value
 * @param periods - Number of periods
 * @returns Compound annual growth rate as percentage
 */
export function calculateCompoundGrowthRate(
  initialValue: number,
  finalValue: number,
  periods: number
): number {
  if (initialValue <= 0 || periods <= 0) {
    return 0;
  }

  const growthRate = (Math.pow(finalValue / initialValue, 1 / periods) - 1) * 100;
  return Math.round(growthRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Analyze metric performance against targets
 * @param actual - Actual value
 * @param target - Target value
 * @returns Performance analysis
 */
export function analyzePerformanceVsTarget(
  actual: number,
  target: number
): {
  performance: 'above' | 'below' | 'on-target';
  variance: number;
  variancePercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
} {
  const variance = actual - target;
  const variancePercentage = calculatePercentageChange(actual, target);
  
  let performance: 'above' | 'below' | 'on-target';
  let status: 'excellent' | 'good' | 'warning' | 'critical';

  if (Math.abs(variancePercentage) < 5) {
    performance = 'on-target';
    status = 'good';
  } else if (variance > 0) {
    performance = 'above';
    status = variancePercentage > 20 ? 'excellent' : 'good';
  } else {
    performance = 'below';
    status = variancePercentage < -20 ? 'critical' : 'warning';
  }

  return {
    performance,
    variance,
    variancePercentage,
    status,
  };
}

/**
 * Calculate metric velocity (rate of change over time)
 * @param values - Array of values over time
 * @returns Velocity (change per time unit)
 */
export function calculateMetricVelocity(
  values: number[]
): {
  velocity: number;
  acceleration: number;
  trend: 'accelerating' | 'decelerating' | 'steady';
} {
  if (values.length < 2) {
    return { velocity: 0, acceleration: 0, trend: 'steady' };
  }

  // Calculate velocity (first derivative)
  const velocities: number[] = [];
  for (let i = 1; i < values.length; i++) {
    velocities.push(values[i] - values[i - 1]);
  }

  const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;

  // Calculate acceleration (second derivative)
  let acceleration = 0;
  let trend: 'accelerating' | 'decelerating' | 'steady' = 'steady';

  if (velocities.length > 1) {
    const accelerations: number[] = [];
    for (let i = 1; i < velocities.length; i++) {
      accelerations.push(velocities[i] - velocities[i - 1]);
    }
    
    acceleration = accelerations.reduce((sum, a) => sum + a, 0) / accelerations.length;
    
    if (Math.abs(acceleration) > 0.1) {
      trend = acceleration > 0 ? 'accelerating' : 'decelerating';
    }
  }

  return {
    velocity: Math.round(avgVelocity * 100) / 100,
    acceleration: Math.round(acceleration * 100) / 100,
    trend,
  };
}

/**
 * Generate metric insights based on trend analysis
 * @param trendData - Trend data from calculateTrendData
 * @returns Array of insight strings
 */
export function generateMetricInsights(trendData: TrendData): string[] {
  const insights: string[] = [];
  const { percentageChange, trend, isSignificant, current, previous } = trendData;

  if (!isSignificant) {
    insights.push('Performance remains stable with minimal change');
    return insights;
  }

  const absChange = Math.abs(percentageChange);
  
  if (trend === 'up') {
    if (absChange > 50) {
      insights.push('Exceptional growth detected - investigate driving factors');
    } else if (absChange > 25) {
      insights.push('Strong positive momentum - maintain current strategies');
    } else {
      insights.push('Healthy growth trend observed');
    }
  } else if (trend === 'down') {
    if (absChange > 50) {
      insights.push('Critical decline requires immediate attention');
    } else if (absChange > 25) {
      insights.push('Significant decrease - review and adjust strategies');
    } else {
      insights.push('Minor decline - monitor closely');
    }
  }

  // Add context about absolute numbers
  if (current > previous * 2) {
    insights.push('Value has more than doubled');
  } else if (current < previous / 2) {
    insights.push('Value has decreased by more than half');
  }

  return insights;
}

/**
 * Utility function to safely handle division by zero in calculations
 * @param numerator - Numerator value
 * @param denominator - Denominator value
 * @param fallback - Fallback value if denominator is zero (default: 0)
 * @returns Safe division result
 */
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  return denominator === 0 ? fallback : numerator / denominator;
}

/**
 * Normalize values to a 0-100 scale for comparison
 * @param values - Array of values to normalize
 * @returns Array of normalized values (0-100)
 */
export function normalizeValues(values: number[]): number[] {
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  if (range === 0) return values.map(() => 50); // All values are the same
  
  return values.map(value => Math.round(((value - min) / range) * 100));
}
