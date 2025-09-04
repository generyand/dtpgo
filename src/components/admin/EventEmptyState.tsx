'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, ArrowLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventEmptyStateProps {
  onBackToEvents?: () => void;
  onCreateEvent?: () => void;
  onSearchEvents?: () => void;
  variant?: 'default' | 'no-events' | 'no-selection';
  className?: string;
}

export function EventEmptyState({
  onBackToEvents,
  onCreateEvent,
  variant = 'default',
  className,
}: EventEmptyStateProps) {
  const getContent = () => {
    switch (variant) {
      case 'no-events':
        return {
          icon: Calendar,
          title: 'No Events Created Yet',
          description: 'Get started by creating your first event to manage attendance and sessions.',
          primaryAction: {
            label: 'Create First Event',
            onClick: onCreateEvent,
            icon: Plus,
          },
          secondaryAction: {
            label: 'Learn More',
            onClick: () => window.open('/docs/events', '_blank'),
            icon: null,
          },
        };
      
      case 'no-selection':
        return {
          icon: Search,
          title: 'Select an Event to View Details',
          description: 'Choose an event from the list to see its sessions, organizers, and statistics.',
          primaryAction: {
            label: 'Back to Events',
            onClick: onBackToEvents,
            icon: ArrowLeft,
          },
          secondaryAction: {
            label: 'Create New Event',
            onClick: onCreateEvent,
            icon: Plus,
          },
        };
      
      default:
        return {
          icon: Calendar,
          title: 'Welcome to Event Management',
          description: 'Select an event from the list to view details, or create a new event to get started.',
          primaryAction: {
            label: 'Create Event',
            onClick: onCreateEvent,
            icon: Plus,
          },
          secondaryAction: {
            label: 'View All Events',
            onClick: onBackToEvents,
            icon: null,
          },
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className={cn("flex items-center justify-center min-h-[400px] p-8", className)}>
      <Card className="max-w-md w-full text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
        <CardContent className="p-8">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <IconComponent className="h-8 w-8 text-gray-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {content.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {content.description}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action */}
            {content.primaryAction?.onClick && (
              <Button 
                onClick={content.primaryAction.onClick}
                className="w-full"
                size="lg"
              >
                {content.primaryAction.icon && (
                  <content.primaryAction.icon className="h-4 w-4 mr-2" />
                )}
                {content.primaryAction.label}
              </Button>
            )}

            {/* Secondary Action */}
            {content.secondaryAction?.onClick && (
              <Button 
                onClick={content.secondaryAction.onClick}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {content.secondaryAction.icon && (
                  <content.secondaryAction.icon className="h-4 w-4 mr-2" />
                )}
                {content.secondaryAction.label}
              </Button>
            )}
          </div>

          {/* Helpful Tips */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Tips:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {variant === 'no-events' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Events can have multiple sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Assign organizers to manage attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Track student participation in real-time</span>
                  </div>
                </>
              )}
              
              {variant === 'no-selection' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Click on any event to view details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Use search and filters to find events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Create new events when needed</span>
                  </div>
                </>
              )}
              
              {variant === 'default' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Events are organized by date and status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Each event can have multiple sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Track attendance and organizer assignments</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
