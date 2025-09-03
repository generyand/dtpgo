'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

interface TimeValue {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
}

const QUICK_TIMES = [
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
];

export function TimePicker({ 
  value = '', 
  onChange, 
  placeholder = 'Select time',
  disabled = false,
  className,
  error
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<TimeValue>({ hour: 12, minute: 0, period: 'AM' });
  const [inputValue, setInputValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse time string to TimeValue
  const parseTime = (timeStr: string): TimeValue => {
    if (!timeStr) return { hour: 12, minute: 0, period: 'AM' };
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours === 0) return { hour: 12, minute: minutes, period: 'AM' };
    if (hours === 12) return { hour: 12, minute: minutes, period: 'PM' };
    if (hours > 12) return { hour: hours - 12, minute: minutes, period: 'PM' };
    return { hour: hours, minute: minutes, period: 'AM' };
  };

  // Convert TimeValue to 24-hour string
  const formatTime = (time: TimeValue): string => {
    let hour = time.hour;
    if (time.period === 'PM' && hour !== 12) hour += 12;
    if (time.period === 'AM' && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  };

  // Update input value when time changes
  useEffect(() => {
    if (!isEditing) {
      const formatted = formatTime(timeValue);
      setInputValue(formatted);
      onChange?.(formatted);
    }
  }, [timeValue, onChange, isEditing]);

  // Initialize with value
  useEffect(() => {
    if (value) {
      setTimeValue(parseTime(value));
      setInputValue(value);
    }
  }, [value]);

  const handleHourChange = (increment: boolean) => {
    setTimeValue(prev => {
      let newHour = increment ? prev.hour + 1 : prev.hour - 1;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      return { ...prev, hour: newHour };
    });
  };

  const handleMinuteChange = (increment: boolean) => {
    setTimeValue(prev => {
      let newMinute = increment ? prev.minute + 15 : prev.minute - 15;
      if (newMinute >= 60) newMinute = 0;
      if (newMinute < 0) newMinute = 45;
      return { ...prev, minute: newMinute };
    });
  };

  const handlePeriodToggle = () => {
    setTimeValue(prev => ({
      ...prev,
      period: prev.period === 'AM' ? 'PM' : 'AM'
    }));
  };

  const handleQuickTimeSelect = (timeStr: string) => {
    setTimeValue(parseTime(timeStr));
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // Try to parse the input value
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = inputValue.match(timeRegex);
    
    if (match) {
      const hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const period = match[3].toUpperCase() as 'AM' | 'PM';
      
      if (hour >= 1 && hour <= 12 && minute >= 0 && minute < 60) {
        setTimeValue({ hour, minute, period });
      } else {
        // Reset to current time value if invalid
        setInputValue(formatTime(timeValue));
      }
    } else {
      // Reset to current time value if invalid format
      setInputValue(formatTime(timeValue));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive focus:ring-destructive'
            )}
            disabled={disabled}
          >
            <Clock className="mr-2 h-4 w-4" />
            {inputValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Time Display */}
            <div className="flex items-center justify-center space-x-2">
              {/* Hour */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleHourChange(true)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="text-2xl font-bold min-w-[3rem] text-center">
                  {timeValue.hour.toString().padStart(2, '0')}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleHourChange(false)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-2xl font-bold">:</div>
              
              {/* Minute */}
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleMinuteChange(true)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <div className="text-2xl font-bold min-w-[3rem] text-center">
                  {timeValue.minute.toString().padStart(2, '0')}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleMinuteChange(false)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              {/* AM/PM */}
              <div className="flex flex-col items-center ml-4">
                <Button
                  variant={timeValue.period === 'AM' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0 mb-1"
                  onClick={handlePeriodToggle}
                >
                  AM
                </Button>
                <Button
                  variant={timeValue.period === 'PM' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handlePeriodToggle}
                >
                  PM
                </Button>
              </div>
            </div>
            
            {/* Quick Times */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Quick Times</div>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_TIMES.map((time) => (
                  <Button
                    key={time.value}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleQuickTimeSelect(time.value)}
                  >
                    {time.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Manual Input */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Manual Input</div>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                placeholder="12:00 PM"
                className="text-center"
              />
              <div className="text-xs text-muted-foreground text-center">
                Format: HH:MM AM/PM (e.g., 2:30 PM)
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {error && (
        <div className="text-sm text-destructive mt-1">{error}</div>
      )}
    </div>
  );
}
