'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Skeleton loader for events list
export function EventsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for event details
export function EventDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex gap-4">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Error state component
export function EventErrorState({ 
  error, 
  onRetry, 
  className 
}: { 
  error: string; 
  onRetry: () => void; 
  className?: string;
}) {
  return (
    <Card className={cn("border-red-200 bg-red-50", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900">Failed to Load Events</h3>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// Empty state with loading skeleton
export function EventEmptyStateSkeleton() {
  return (
    <div className="text-center py-12 animate-pulse">
      <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
    </div>
  );
}

// Warning state for partial data
export function EventWarningState({ 
  message, 
  onDismiss, 
  className 
}: { 
  message: string; 
  onDismiss: () => void; 
  className?: string;
}) {
  return (
    <Card className={cn("border-yellow-200 bg-yellow-50", className)}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 text-sm">{message}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDismiss}
          className="text-yellow-700 hover:bg-yellow-100"
        >
          Dismiss
        </Button>
      </CardContent>
    </Card>
  );
}

// Loading overlay for the entire interface
export function EventManagementLoadingOverlay({ 
  isLoading, 
  message = "Loading events..." 
}: { 
  isLoading: boolean; 
  message?: string;
}) {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Skeleton for filters
export function EventFiltersSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}
