'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/loading';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  ChevronDown, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { organizerFeedback } from '@/lib/utils/toast-feedback';

// Types
interface Organizer {
  id: string;
  email: string;
  fullName: string;
  role: 'organizer' | 'admin';
  isActive: boolean;
  lastLoginAt: string | null;
}

interface AssignedOrganizer {
  assignmentId: string;
  organizer: Organizer;
  assignedAt: string;
}

interface QuickOrganizerAssignmentProps {
  eventId: string;
  eventName: string;
  assignedOrganizers: AssignedOrganizer[];
  onAssignmentChange?: () => void;
  className?: string;
}

export function QuickOrganizerAssignment({
  eventId,
  eventName,
  assignedOrganizers,
  onAssignmentChange,
  className,
}: QuickOrganizerAssignmentProps) {
  const [availableOrganizers, setAvailableOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string[]>([]);
  const [removing, setRemoving] = useState<string[]>([]);

  // Fetch available organizers
  const fetchAvailableOrganizers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/organizers');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch organizers');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch organizers');
      }
      
      // Filter out already assigned organizers
      const assignedIds = assignedOrganizers.map(a => a.organizer.id);
      const available = data.organizers.filter((org: Organizer) => 
        !assignedIds.includes(org.id) && org.isActive
      );
      
      setAvailableOrganizers(available);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organizers';
      setError(errorMessage);
      organizerFeedback.assign.error('organizers', eventName, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Assign organizer to event
  const assignOrganizer = async (organizerId: string) => {
    const organizer = availableOrganizers.find(org => org.id === organizerId);
    if (!organizer) return;

    const toastId = organizerFeedback.assign.loading(organizer.fullName, eventName);
    setAssigning(prev => [...prev, organizerId]);
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}/organizers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizerIds: [organizerId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign organizer');
      }

      organizerFeedback.assign.success(organizer.fullName, eventName, toastId?.toString());
      
      // Refresh available organizers and notify parent
      await fetchAvailableOrganizers();
      onAssignmentChange?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign organizer';
      organizerFeedback.assign.error(organizer.fullName, eventName, errorMessage, toastId?.toString());
    } finally {
      setAssigning(prev => prev.filter(id => id !== organizerId));
    }
  };

  // Remove organizer from event
  const removeOrganizer = async (assignmentId: string, organizerId: string) => {
    const organizer = assignedOrganizers.find(a => a.organizer.id === organizerId)?.organizer;
    if (!organizer) return;

    const toastId = organizerFeedback.assign.loading(`${organizer.fullName} removed from ${eventName}`, '');
    setRemoving(prev => [...prev, organizerId]);
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}/organizers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizerId,
          reason: 'Removed via quick assignment',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove organizer');
      }

      organizerFeedback.assign.success(`${organizer.fullName} removed from ${eventName}`, '', toastId?.toString());
      
      // Refresh available organizers and notify parent
      await fetchAvailableOrganizers();
      onAssignmentChange?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove organizer';
      organizerFeedback.assign.error(organizer.fullName, eventName, errorMessage, toastId?.toString());
    } finally {
      setRemoving(prev => prev.filter(id => id !== organizerId));
    }
  };

  // Load available organizers on mount
  useEffect(() => {
    fetchAvailableOrganizers();
  }, [eventId, assignedOrganizers]);

  // Format last login helper
  const formatLastLogin = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return 'Never';
    
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastLogin.toLocaleDateString();
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Assigned Organizers Display */}
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          {assignedOrganizers.length} assigned
        </span>
      </div>

      {/* Quick Assignment Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2"
            disabled={loading}
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Quick Assign
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Organizer Assignment</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAvailableOrganizers}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            </Button>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Error State */}
          {error && (
            <div className="p-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          )}
          
          {/* Available Organizers */}
          {!loading && !error && availableOrganizers.length > 0 && (
            <React.Fragment key="available-organizers">
              <DropdownMenuLabel className="text-xs text-gray-500">
                Available Organizers ({availableOrganizers.length})
              </DropdownMenuLabel>
              {availableOrganizers.map((organizer) => (
                <DropdownMenuItem
                  key={organizer.id}
                  onClick={() => assignOrganizer(organizer.id)}
                  disabled={assigning.includes(organizer.id)}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0',
                      organizer.role === 'admin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    )}>
                      {organizer.role === 'admin' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium truncate">
                          {organizer.fullName}
                        </span>
                        <Badge 
                          variant={organizer.role === 'admin' ? 'default' : 'secondary'}
                          className="text-xs px-1 py-0"
                        >
                          {organizer.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {organizer.email}
                      </div>
                    </div>
                  </div>
                  
                  {assigning.includes(organizer.id) ? (
                    <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                  ) : (
                    <UserPlus className="h-3 w-3 text-gray-400" />
                  )}
                </DropdownMenuItem>
              ))}
            </React.Fragment>
          )}
          
          {/* No Available Organizers */}
          {!loading && !error && availableOrganizers.length === 0 && (
            <div className="p-2 text-center text-sm text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>All organizers are assigned</p>
              <p className="text-xs">or no active organizers available</p>
            </div>
          )}
          
          {/* Assigned Organizers */}
          {assignedOrganizers.length > 0 && (
            <React.Fragment key="assigned-organizers">
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-500">
                Assigned Organizers ({assignedOrganizers.length})
              </DropdownMenuLabel>
              {assignedOrganizers.map((assignment) => (
                <DropdownMenuItem
                  key={assignment.assignmentId}
                  onClick={() => removeOrganizer(assignment.assignmentId, assignment.organizer.id)}
                  disabled={removing.includes(assignment.organizer.id)}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0',
                      assignment.organizer.role === 'admin' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    )}>
                      {assignment.organizer.role === 'admin' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium truncate">
                          {assignment.organizer.fullName}
                        </span>
                        <Badge 
                          variant={assignment.organizer.role === 'admin' ? 'default' : 'secondary'}
                          className="text-xs px-1 py-0"
                        >
                          {assignment.organizer.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        Last login: {formatLastLogin(assignment.organizer.lastLoginAt)}
                      </div>
                    </div>
                  </div>
                  
                  {removing.includes(assignment.organizer.id) ? (
                    <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                  ) : (
                    <UserMinus className="h-3 w-3 text-red-400" />
                  )}
                </DropdownMenuItem>
              ))}
            </React.Fragment>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
