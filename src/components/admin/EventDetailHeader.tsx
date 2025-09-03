'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, Edit, Plus, MoreHorizontal } from 'lucide-react';
import { EventWithDetails } from '@/lib/types/event';
import { EventStatusBadge } from './EventStatusBadge';
import { cn } from '@/lib/utils';

interface EventDetailHeaderProps {
  event: EventWithDetails;
  onEdit: () => void;
  onCreateSession: () => void;
  onMoreActions?: () => void;
  className?: string;
}

export function EventDetailHeader({
  event,
  onEdit,
  onCreateSession,
  onMoreActions,
  className,
}: EventDetailHeaderProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventDuration = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours === 0) return `${diffMinutes} minutes`;
    if (diffMinutes === 0) return `${diffHours} hours`;
    return `${diffHours}h ${diffMinutes}m`;
  };

  const isCurrentlyActive = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  };

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 truncate" title={event.name}>
                {event.name}
              </h1>
              <EventStatusBadge
                isActive={event.isActive}
                sessionCount={event._count.sessions}
                organizerCount={event._count.organizerAssignments}
                startDate={event.startDate}
                endDate={event.endDate}
                variant="detailed"
              />
            </div>

            {event.description && (
              <p className="text-gray-600 text-base md:text-lg mb-3 max-w-3xl line-clamp-2" title={event.description}>
                {event.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-600 truncate" title={formatDate(event.startDate)}>
                    {formatDate(event.startDate)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Duration: {getEventDuration()}</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600 truncate" title={event.location}>{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sessions</p>
                  <p className="text-sm text-gray-600">
                    {event._count.sessions} session{event._count.sessions !== 1 ? 's' : ''}
                  </p>
                  {event._count.sessions > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {event._count.attendance} attendance records
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Organizers</p>
                  <p className="text-sm text-gray-600">
                    {event._count.organizerAssignments} assigned
                  </p>
                  {isCurrentlyActive() && event._count.organizerAssignments > 0 && (
                    <Badge variant="default" className="mt-1 text-xs bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4 flex-shrink-0 w-40">
            <Button onClick={onEdit} variant="outline" size="sm" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
            <Button onClick={onCreateSession} size="sm" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
            {onMoreActions && (
              <Button onClick={onMoreActions} variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-gray-900">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                More Actions
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 px-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">
                {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium text-gray-900">
                {new Date(event.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <EventStatusBadge
              isActive={event.isActive}
              sessionCount={event._count.sessions}
              organizerCount={event._count.organizerAssignments}
              startDate={event.startDate}
              endDate={event.endDate}
              variant="compact"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
