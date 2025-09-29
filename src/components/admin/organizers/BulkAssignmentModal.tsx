'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Calendar,
  UserPlus,
  UserMinus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  X,
  Mail,
  Shield,
  ShieldCheck,
  Clock,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types for the component
interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isActive: boolean;
  organizerAssignments?: Array<{
    organizer: {
      id: string;
      fullName: string;
      email: string;
      role: 'organizer' | 'admin';
    };
  }>;
  _count?: {
    attendance: number;
    sessions: number;
  };
}

interface Organizer {
  id: string;
  email: string;
  fullName: string;
  role: 'organizer' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BulkAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

export function BulkAssignmentModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  className 
}: BulkAssignmentModalProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  
  // Search and filter state
  const [eventSearch, setEventSearch] = useState('');
  const [organizerSearch, setOrganizerSearch] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Operation state
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fetch events and organizers
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch events and organizers in parallel
      const [eventsResponse, organizersResponse] = await Promise.all([
        fetch('/api/admin/events?limit=100&isActive=true'),
        fetch('/api/admin/organizers')
      ]);
      
      if (!eventsResponse.ok || !organizersResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const eventsData = await eventsResponse.json();
      const organizersData = await organizersResponse.json();
      
      setEvents(eventsData.events || []);
      setOrganizers(organizersData.organizers || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedEvents([]);
      setSelectedOrganizers([]);
      setEventSearch('');
      setOrganizerSearch('');
      setShowActiveOnly(true);
      setError(null);
    }
  }, [isOpen]);

  // Filter events based on search and active status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
                         event.description?.toLowerCase().includes(eventSearch.toLowerCase()) ||
                         event.location?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesActive = !showActiveOnly || event.isActive;
    return matchesSearch && matchesActive;
  });

  // Filter organizers based on search and active status
  const filteredOrganizers = organizers.filter(organizer => {
    const matchesSearch = organizer.fullName.toLowerCase().includes(organizerSearch.toLowerCase()) ||
                         organizer.email.toLowerCase().includes(organizerSearch.toLowerCase());
    const matchesActive = !showActiveOnly || organizer.isActive;
    return matchesSearch && matchesActive;
  });

  // Handle event selection
  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  // Handle organizer selection
  const handleOrganizerToggle = (organizerId: string) => {
    setSelectedOrganizers(prev => 
      prev.includes(organizerId) 
        ? prev.filter(id => id !== organizerId)
        : [...prev, organizerId]
    );
  };

  // Select all events
  const handleSelectAllEvents = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id));
    }
  };

  // Select all organizers
  const handleSelectAllOrganizers = () => {
    if (selectedOrganizers.length === filteredOrganizers.length) {
      setSelectedOrganizers([]);
    } else {
      setSelectedOrganizers(filteredOrganizers.map(organizer => organizer.id));
    }
  };

  // Bulk assign organizers to events
  const handleBulkAssign = async () => {
    if (selectedEvents.length === 0 || selectedOrganizers.length === 0) {
      toast.error('Please select at least one event and one organizer');
      return;
    }

    try {
      setIsAssigning(true);
      
      // Create assignment requests for each event
      const assignmentPromises = selectedEvents.map(eventId =>
        fetch(`/api/admin/events/${eventId}/organizers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizerIds: selectedOrganizers,
          }),
        })
      );

      const results = await Promise.allSettled(assignmentPromises);
      
      // Check results
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.ok
      ).length;
      
      const failed = results.length - successful;
      
      if (successful > 0) {
        toast.success(`Successfully assigned organizers to ${successful} event(s)`);
      }
      
      if (failed > 0) {
        toast.error(`Failed to assign organizers to ${failed} event(s)`);
      }
      
      // Refresh data and clear selection
      await fetchData();
      setSelectedEvents([]);
      setSelectedOrganizers([]);
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign organizers';
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  // Bulk remove organizers from events
  const handleBulkRemove = async () => {
    if (selectedEvents.length === 0 || selectedOrganizers.length === 0) {
      toast.error('Please select at least one event and one organizer');
      return;
    }

    try {
      setIsRemoving(true);
      
      // Create removal requests for each event-organizer combination
      const removalPromises = selectedEvents.flatMap(eventId =>
        selectedOrganizers.map(organizerId =>
          fetch(`/api/admin/events/${eventId}/organizers`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              organizerId,
              reason: 'Bulk removal by admin',
            }),
          })
        )
      );

      const results = await Promise.allSettled(removalPromises);
      
      // Check results
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.ok
      ).length;
      
      const failed = results.length - successful;
      
      if (successful > 0) {
        toast.success(`Successfully removed organizers from ${successful} assignment(s)`);
      }
      
      if (failed > 0) {
        toast.error(`Failed to remove ${failed} assignment(s)`);
      }
      
      // Refresh data and clear selection
      await fetchData();
      setSelectedEvents([]);
      setSelectedOrganizers([]);
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove organizers';
      toast.error(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get assignment count for an event
  const getEventAssignmentCount = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.organizerAssignments?.length || 0;
  };

  const hasSelection = selectedEvents.length > 0 && selectedOrganizers.length > 0;
  const allEventsSelected = filteredEvents.length > 0 && selectedEvents.length === filteredEvents.length;
  const allOrganizersSelected = filteredOrganizers.length > 0 && selectedOrganizers.length === filteredOrganizers.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-4xl max-h-[90vh] overflow-hidden', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Bulk Organizer Assignment</span>
          </DialogTitle>
          <DialogDescription>
            Assign or remove organizers from multiple events at once. Select events and organizers, then choose your action.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  className="ml-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Events Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Events ({filteredEvents.length})</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allEventsSelected}
                      onCheckedChange={handleSelectAllEvents}
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                </div>

                {/* Event Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* Events List */}
                <div className="max-h-64 overflow-auto space-y-2 border rounded-md p-2">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No events found</p>
                    </div>
                  ) : (
                    filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleEventToggle(event.id)}
                      >
                        <Checkbox
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => handleEventToggle(event.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm truncate">{event.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getEventAssignmentCount(event.id)} organizers
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.description || 'No description'}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                            <span>{formatDate(event.startDate)}</span>
                            {event.location && (
                              <>
                                <span>•</span>
                                <span className="truncate">{event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Organizers Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Organizers ({filteredOrganizers.length})</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={allOrganizersSelected}
                      onCheckedChange={handleSelectAllOrganizers}
                    />
                    <span className="text-sm text-muted-foreground">Select All</span>
                  </div>
                </div>

                {/* Organizer Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search organizers..."
                    value={organizerSearch}
                    onChange={(e) => setOrganizerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
                  />
                </div>

                {/* Organizers List */}
                <div className="max-h-64 overflow-auto space-y-2 border rounded-md p-2">
                  {filteredOrganizers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No organizers found</p>
                    </div>
                  ) : (
                    filteredOrganizers.map((organizer) => (
                      <div
                        key={organizer.id}
                        className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleOrganizerToggle(organizer.id)}
                      >
                        <Checkbox
                          checked={selectedOrganizers.includes(organizer.id)}
                          onChange={() => handleOrganizerToggle(organizer.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm truncate">{organizer.fullName}</h4>
                            <Badge 
                              variant={organizer.role === 'admin' ? 'default' : 'secondary'}
                              className={cn(
                                'text-xs',
                                organizer.role === 'admin' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                              )}
                            >
                              {organizer.role === 'admin' ? (
                                <>
                                  <Shield className="mr-1 h-3 w-3" />
                                  Admin
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="mr-1 h-3 w-3" />
                                  Organizer
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{organizer.email}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {hasSelection && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{selectedEvents.length} event(s) selected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{selectedOrganizers.length} organizer(s) selected</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEvents([]);
                  setSelectedOrganizers([]);
                }}
              >
                <X className="h-3 w-3 mr-1" />
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="destructive"
              onClick={handleBulkRemove}
              disabled={!hasSelection || isRemoving || isAssigning}
            >
              {isRemoving ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserMinus className="h-3 w-3 mr-1" />
                  Remove Selected
                </>
              )}
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={!hasSelection || isAssigning || isRemoving}
            >
              {isAssigning ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Assign Selected
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
