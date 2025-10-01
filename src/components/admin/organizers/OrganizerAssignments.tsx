'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/loading';
import {
  Users,
  UserPlus,
  UserMinus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Mail,
  Shield,
  ShieldCheck,
  Clock,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { organizerFeedback } from '@/lib/utils/toast-feedback';

// Types for the component
interface Organizer {
  id: string;
  email: string;
  fullName: string;
  role: 'organizer' | 'admin';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AssignedOrganizer {
  assignmentId: string;
  organizer: Organizer;
  assignedAt: string;
  assignedBy: string;
}

interface EventOrganizersData {
  event: {
    id: string;
    name: string;
    isActive: boolean;
  };
  assignedOrganizers: AssignedOrganizer[];
  availableOrganizers: Organizer[];
  statistics: {
    totalAssigned: number;
    totalAvailable: number;
    activeOrganizers: number;
    adminOrganizers: number;
    regularOrganizers: number;
  };
}

interface OrganizerAssignmentsProps {
  eventId: string;
  className?: string;
}

export function OrganizerAssignments({ eventId, className }: OrganizerAssignmentsProps) {
  const [data, setData] = useState<EventOrganizersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  const [removingOrganizer, setRemovingOrganizer] = useState<string | null>(null);
  const [assigningOrganizers, setAssigningOrganizers] = useState(false);

  // Fetch event organizers data
  const fetchEventOrganizers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/events/${eventId}/organizers`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch event organizers');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event organizers';
      setError(errorMessage);
      organizerFeedback.assign.error('organizers', 'event', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Assign organizers to event
  const assignOrganizers = async () => {
    if (selectedOrganizers.length === 0) {
      organizerFeedback.assign.error('organizers', data?.event.name || 'event', 'Please select at least one organizer');
      return;
    }

    const eventName = data?.event.name || 'event';
    const toastId = organizerFeedback.assign.loading(selectedOrganizers.join(', '), eventName);
    setAssigningOrganizers(true);
    
    try {
      const response = await fetch(`/api/admin/events/${eventId}/organizers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizerIds: selectedOrganizers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign organizers');
      }

      const _result = await response.json();
      organizerFeedback.assign.success(selectedOrganizers.join(', '), eventName, String(toastId));
      
      // Refresh data and clear selection
      await fetchEventOrganizers();
      setSelectedOrganizers([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign organizers';
      organizerFeedback.assign.error(selectedOrganizers.join(', '), eventName, errorMessage, String(toastId));
    } finally {
      setAssigningOrganizers(false);
    }
  };

  // Remove organizer from event
  const removeOrganizer = async (assignmentId: string, organizerId: string) => {
    const organizerName = data?.assignedOrganizers.find(org => org.organizer.id === organizerId)?.organizer.fullName || 'organizer';
    const eventName = data?.event.name || 'event';
    const toastId = organizerFeedback.assign.loading(organizerName, eventName);
    
    try {
      setRemovingOrganizer(organizerId);
      
      const response = await fetch(`/api/admin/events/${eventId}/organizers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizerId,
          reason: 'Removed by admin',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove organizer');
      }

      const _result = await response.json();
      organizerFeedback.assign.success(`${organizerName} removed from ${eventName}`, '', String(toastId));
      
      // Refresh data
      await fetchEventOrganizers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove organizer';
      organizerFeedback.assign.error(organizerName, eventName, errorMessage, String(toastId));
    } finally {
      setRemovingOrganizer(null);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchEventOrganizers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Prepare multi-select options
  const availableOptions = data?.availableOrganizers.map(organizer => ({
    value: organizer.id,
    label: organizer.fullName,
    description: `${organizer.email} • ${organizer.role}`,
    disabled: !organizer.isActive,
  })) || [];

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    
    return formatDate(lastLoginAt);
  };

  // Loading state
  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Event Organizers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Event Organizers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEventOrganizers}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Event Organizers</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEventOrganizers}
            disabled={loading}
          >
            <RefreshCw className={cn('h-3 w-3 mr-1', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Total Assigned</p>
              <p className="text-2xl font-bold text-blue-600">{data.statistics.totalAssigned}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Active Organizers</p>
              <p className="text-2xl font-bold text-green-600">{data.statistics.activeOrganizers}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Admin Organizers</p>
              <p className="text-2xl font-bold text-purple-600">{data.statistics.adminOrganizers}</p>
            </div>
          </div>
        </div>

        {/* Assign New Organizers */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <h3 className="font-medium">Assign Organizers</h3>
          </div>
          
          <div className="space-y-3">
            <MultiSelect
              options={availableOptions}
              value={selectedOrganizers}
              onChange={setSelectedOrganizers}
              placeholder="Select organizers to assign..."
              searchPlaceholder="Search organizers..."
              emptyMessage="No available organizers found."
              maxDisplay={2}
            />
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={assignOrganizers}
                disabled={selectedOrganizers.length === 0 || assigningOrganizers}
                size="sm"
              >
                {assigningOrganizers ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3 mr-1" />
                    Assign Selected ({selectedOrganizers.length})
                  </>
                )}
              </Button>
              
              {selectedOrganizers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrganizers([])}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Organizers List */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <h3 className="font-medium">Assigned Organizers ({data.assignedOrganizers.length})</h3>
          </div>
          
          {data.assignedOrganizers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No organizers assigned to this event</p>
              <p className="text-sm">Use the form above to assign organizers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.assignedOrganizers.map((assignment) => (
                <div
                  key={assignment.assignmentId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      assignment.organizer.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    )}>
                      {assignment.organizer.role === 'admin' ? (
                        <Shield className="h-4 w-4" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{assignment.organizer.fullName}</h4>
                        <Badge 
                          variant={assignment.organizer.role === 'admin' ? 'default' : 'secondary'}
                          className={cn(
                            'text-xs',
                            assignment.organizer.role === 'admin' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          )}
                        >
                          {assignment.organizer.role}
                        </Badge>
                        <Badge 
                          variant={assignment.organizer.isActive ? 'default' : 'destructive'}
                          className={cn(
                            'text-xs',
                            assignment.organizer.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          )}
                        >
                          {assignment.organizer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{assignment.organizer.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>Last login: {formatLastLogin(assignment.organizer.lastLoginAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Assigned: {formatDate(assignment.assignedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOrganizer(assignment.assignmentId, assignment.organizer.id)}
                    disabled={removingOrganizer === assignment.organizer.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {removingOrganizer === assignment.organizer.id ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <UserMinus className="h-3 w-3 mr-1" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
