'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface EventStatusBadgeProps {
  isActive: boolean;
  sessionCount: number;
  organizerCount: number;
  startDate: Date | string;
  endDate: Date | string;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function EventStatusBadge({
  isActive,
  sessionCount,
  organizerCount,
  startDate,
  endDate,
  variant = 'default',
  className,
}: EventStatusBadgeProps) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Determine event status
  const getEventStatus = () => {
    if (!isActive) return 'inactive';
    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'active';
    if (now > end) return 'ended';
    return 'active';
  };

  const status = getEventStatus();

  // Get status colors and icons
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconClassName: 'text-green-600',
        };
      case 'upcoming':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Calendar,
          iconClassName: 'text-blue-600',
        };
      case 'ended':
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle,
          iconClassName: 'text-gray-600',
        };
      case 'inactive':
        return {
          variant: 'secondary' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconClassName: 'text-red-600',
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          iconClassName: 'text-gray-600',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  // Get status label
  const getStatusLabel = () => {
    switch (status) {
      case 'active': return 'Active Now';
      case 'upcoming': return 'Upcoming';
      case 'ended': return 'Ended';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  // Compact variant - just the status badge
  if (variant === 'compact') {
    return (
      <Badge
        variant={statusConfig.variant}
        className={cn(
          'border px-2 py-1 text-xs font-medium',
          statusConfig.className,
          className
        )}
      >
        <IconComponent className="h-3 w-3 mr-1" />
        {getStatusLabel()}
      </Badge>
    );
  }

  // Default variant - status badge with session count
  if (variant === 'default') {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant={statusConfig.variant}
          className={cn(
            'border px-2 py-1 text-xs font-medium',
            statusConfig.className,
            className
          )}
        >
          <IconComponent className="h-3 w-3 mr-1" />
          {getStatusLabel()}
        </Badge>
        
        {/* Session count indicator */}
        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border">
          <Clock className="h-3 w-3" />
          <span className="font-medium">{sessionCount}</span>
          <span className="text-gray-500">sessions</span>
        </div>
      </div>
    );
  }

  // Detailed variant - full status display with all indicators
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Main status badge */}
      <Badge
        variant={statusConfig.variant}
        className={cn(
          'border px-3 py-1.5 text-sm font-medium',
          statusConfig.className,
          className
        )}
      >
        <IconComponent className="h-4 w-4 mr-1.5" />
        {getStatusLabel()}
      </Badge>
      
      {/* Session count indicator */}
      <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="font-semibold">{sessionCount}</span>
        <span className="text-gray-600">sessions</span>
      </div>
      
      {/* Organizer count indicator */}
      <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border">
        <Users className="h-4 w-4 text-gray-500" />
        <span className="font-semibold">{organizerCount}</span>
        <span className="text-gray-600">organizers</span>
      </div>
      
      {/* Date range indicator */}
      <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-gray-600">
          {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
