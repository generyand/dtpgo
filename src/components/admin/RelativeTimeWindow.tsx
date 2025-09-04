'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeWindowConfig {
  value: number;
  unit: 'minutes' | 'hours' | 'days';
}

interface RelativeTimeWindowProps {
  startTime?: TimeWindowConfig;
  endTime?: TimeWindowConfig;
  onStartTimeChange?: (config: TimeWindowConfig) => void;
  onEndTimeChange?: (config: TimeWindowConfig) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const TIME_UNITS = [
  { value: 'minutes', label: 'Minutes', maxValue: 59 },
  { value: 'hours', label: 'Hours', maxValue: 23 },
  { value: 'days', label: 'Days', maxValue: 30 }
] as const;

const DEFAULT_START_TIME: TimeWindowConfig = { value: 15, unit: 'minutes' };
const DEFAULT_END_TIME: TimeWindowConfig = { value: 2, unit: 'hours' };

export function RelativeTimeWindow({
  startTime = DEFAULT_START_TIME,
  endTime = DEFAULT_END_TIME,
  onStartTimeChange,
  onEndTimeChange,
  className,
  disabled = false,
  error
}: RelativeTimeWindowProps) {
  const [startConfig, setStartConfig] = useState<TimeWindowConfig>(startTime);
  const [endConfig, setEndConfig] = useState<TimeWindowConfig>(endTime);
  const [validationError, setValidationError] = useState<string>('');

  // Convert time config to minutes
  const convertToMinutes = useCallback((config: TimeWindowConfig): number => {
    switch (config.unit) {
      case 'minutes':
        return config.value;
      case 'hours':
        return config.value * 60;
      case 'days':
        return config.value * 24 * 60;
      default:
        return config.value;
    }
  }, []);

  // Validate time window configuration
  const validateTimeWindow = useCallback((start: TimeWindowConfig, end: TimeWindowConfig): string => {
    if (start.value <= 0 || end.value <= 0) {
      return 'Time values must be greater than 0';
    }

    // Convert both times to minutes for comparison
    const startInMinutes = convertToMinutes(start);
    const endInMinutes = convertToMinutes(end);

    if (startInMinutes >= endInMinutes) {
      return 'Start time must be before end time';
    }

    if (endInMinutes - startInMinutes < 15) {
      return 'Minimum time window is 15 minutes';
    }

    if (endInMinutes - startInMinutes > 24 * 60) {
      return 'Maximum time window is 24 hours';
    }

    return '';
  }, [convertToMinutes]);

  // Format time for display
  const formatTimeDisplay = useCallback((config: TimeWindowConfig): string => {
    if (config.value === 1) {
      return `1 ${config.unit.slice(0, -1)}`;
    }
    return `${config.value} ${config.unit}`;
  }, []);

  // Calculate total duration
  const calculateDuration = useCallback((): string => {
    const startInMinutes = convertToMinutes(startConfig);
    const endInMinutes = convertToMinutes(endConfig);
    const durationInMinutes = endInMinutes - startInMinutes;

    if (durationInMinutes < 60) {
      return `${durationInMinutes} minute${durationInMinutes !== 1 ? 's' : ''}`;
    } else if (durationInMinutes < 24 * 60) {
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = durationInMinutes % 60;
      if (minutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(durationInMinutes / (24 * 60));
      const remainingHours = Math.floor((durationInMinutes % (24 * 60)) / 60);
      if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
      }
      return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
  }, [startConfig, endConfig, convertToMinutes]);

  // Handle start time value change
  const handleStartValueChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    const newConfig = { ...startConfig, value: numValue };
    setStartConfig(newConfig);
    
    const error = validateTimeWindow(newConfig, endConfig);
    setValidationError(error);
    
    onStartTimeChange?.(newConfig);
  }, [startConfig, endConfig, validateTimeWindow, onStartTimeChange]);

  // Handle start time unit change
  const handleStartUnitChange = useCallback((unit: string) => {
    const newConfig = { ...startConfig, unit: unit as TimeWindowConfig['unit'] };
    setStartConfig(newConfig);
    
    const error = validateTimeWindow(newConfig, endConfig);
    setValidationError(error);
    
    onStartTimeChange?.(newConfig);
  }, [startConfig, endConfig, validateTimeWindow, onStartTimeChange]);

  // Handle end time value change
  const handleEndValueChange = useCallback((value: string) => {
    const numValue = parseInt(value) || 0;
    const newConfig = { ...endConfig, value: numValue };
    setEndConfig(newConfig);
    
    const error = validateTimeWindow(startConfig, newConfig);
    setValidationError(error);
    
    onEndTimeChange?.(newConfig);
  }, [startConfig, endConfig, validateTimeWindow, onEndTimeChange]);

  // Handle end time unit change
  const handleEndUnitChange = useCallback((unit: string) => {
    const newConfig = { ...endConfig, unit: unit as TimeWindowConfig['unit'] };
    setEndConfig(newConfig);
    
    const error = validateTimeWindow(startConfig, newConfig);
    setValidationError(error);
    
    onEndTimeChange?.(newConfig);
  }, [startConfig, endConfig, validateTimeWindow, onEndTimeChange]);

  // Validate input value against unit constraints
  const validateInputValue = useCallback((value: number, unit: string): boolean => {
    const unitConfig = TIME_UNITS.find(u => u.value === unit);
    if (!unitConfig) return true;
    return value <= unitConfig.maxValue;
  }, []);

  // Get max value for current unit
  const getMaxValue = useCallback((unit: string): number => {
    const unitConfig = TIME_UNITS.find(u => u.value === unit);
    return unitConfig?.maxValue || 999;
  }, []);

  // Update validation when props change
  useEffect(() => {
    const error = validateTimeWindow(startTime, endTime);
    setValidationError(error);
  }, [startTime, endTime, validateTimeWindow]);

  const hasError = error || validationError;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Relative Time Window
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Time Configuration */}
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time (Before Event)</Label>
            <div className="flex gap-2">
              <Input
                id="start-time"
                type="number"
                min="1"
                max={getMaxValue(startConfig.unit)}
                value={startConfig.value}
                onChange={(e) => handleStartValueChange(e.target.value)}
                disabled={disabled}
                className={cn(
                  'flex-1',
                  !validateInputValue(startConfig.value, startConfig.unit) && 'border-destructive'
                )}
              />
              <Select
                value={startConfig.unit}
                onValueChange={handleStartUnitChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!validateInputValue(startConfig.value, startConfig.unit) && (
              <p className="text-sm text-destructive">
                Maximum value for {startConfig.unit} is {getMaxValue(startConfig.unit)}
              </p>
            )}
          </div>

          {/* End Time Configuration */}
          <div className="space-y-2">
            <Label htmlFor="end-time">End Time (After Event)</Label>
            <div className="flex gap-2">
              <Input
                id="end-time"
                type="number"
                min="1"
                max={getMaxValue(endConfig.unit)}
                value={endConfig.value}
                onChange={(e) => handleEndValueChange(e.target.value)}
                disabled={disabled}
                className={cn(
                  'flex-1',
                  !validateInputValue(endConfig.value, endConfig.unit) && 'border-destructive'
                )}
              />
              <Select
                value={endConfig.unit}
                onValueChange={handleEndUnitChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!validateInputValue(endConfig.value, endConfig.unit) && (
              <p className="text-sm text-destructive">
                Maximum value for {endConfig.unit} is {getMaxValue(endConfig.unit)}
              </p>
            )}
          </div>
        </div>

        {/* Time Window Preview */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Time Window Preview</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {formatTimeDisplay(startConfig)}
                </Badge>
                <span className="text-muted-foreground">to</span>
                <Badge variant="outline" className="font-mono">
                  {formatTimeDisplay(endConfig)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-lg font-semibold">{calculateDuration()}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {hasError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{hasError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
