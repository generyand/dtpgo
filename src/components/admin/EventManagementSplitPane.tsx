'use client';

import React, { useEffect, useState } from 'react';
// import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventWithDetails } from '@/lib/types/event';
import type { EventFilters as EventFiltersModel } from '@/components/admin/EventFilters';
import { EventsList } from '@/components/admin/EventsList';
import { EventDetailHeader } from '@/components/admin/EventDetailHeader';
import { EventDetailTabs } from '@/components/admin/EventDetailTabs';
import { EventEmptyState } from '@/components/admin/EventEmptyState';
import { EventForm } from '@/components/admin/EventForm';
import { SessionForm, SessionFormData } from '@/components/admin/SessionForm';
import { OrganizerAssignments } from '@/components/admin/organizers/OrganizerAssignments';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { eventFeedback, sessionFeedback, genericFeedback } from '@/lib/utils/toast-feedback';
import { 
  EventsListSkeleton, 
  EventDetailsSkeleton, 
  EventErrorState, 
  EventFiltersSkeleton,
  EventManagementLoadingOverlay 
} from '@/components/admin/EventLoadingStates';

export function EventManagementSplitPane() {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState<boolean>(false);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  const [showOrganizerAssignments, setShowOrganizerAssignments] = useState<boolean>(false);
  const [filters, setFilters] = useState<EventFiltersModel>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [currentPage] = useState(1);
  const limit = 10;
  const [localSearch, setLocalSearch] = useState<string>('');

  const fetchEvents = async (options?: { suppressLoading?: boolean; searchOverride?: string }) => {
    try {
      if (!options?.suppressLoading) setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: (options?.searchOverride ?? filters.search) || '',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      if (filters.status !== 'all') params.set('isActive', filters.status === 'active' ? 'true' : 'false');

      const response = await fetch(`/api/admin/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load events');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to load events');

      setEvents(data.events as EventWithDetails[]);
      
      if (!selectedEvent && data.events.length > 0) {
        setSelectedEvent(data.events[0]);
      } else if (selectedEvent) {
        const updated = data.events.find((e: EventWithDetails) => e.id === selectedEvent.id);
        if (updated) setSelectedEvent(updated);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load events');
    } finally {
      if (!options?.suppressLoading) setLoading(false);
    }
  };

  // Initial and non-search filter changes use full loading
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.sortBy, filters.sortOrder]);

  // Debounce search input and suppress loading overlay for search fetches
  useEffect(() => {
    // If cleared, update and fetch immediately for snappy feel
    if (localSearch.trim() === '') {
      setFilters((prev) => (prev.search === '' ? prev : { ...prev, search: '' }));
      fetchEvents({ suppressLoading: true, searchOverride: '' });
      return;
    }

    const handle = setTimeout(() => {
      // Sync debounced search into filters
      setFilters((prev) => (prev.search === localSearch ? prev : { ...prev, search: localSearch }));
      // Trigger fetch without overlay when search changes
      fetchEvents({ suppressLoading: true, searchOverride: localSearch });
    }, 150);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const handleEventSelect = (event: EventWithDetails) => setSelectedEvent(event);

  const handleCreateSession = () => {
    if (!selectedEvent) {
      toast.error('Please select an event first');
      return;
    }
    setIsCreateSessionOpen(true);
  };

  const handleViewOrganizer = (organizerId: string) => {
    // Navigate to organizer details page
    window.open(`/admin/organizers/${organizerId}`, '_blank');
  };

  const handleRemoveOrganizer = async (organizerId: string) => {
    if (!selectedEvent) return;

    const organizer = selectedEvent.organizerAssignments.find(a => a.organizer.id === organizerId)?.organizer;
    if (!organizer) return;

    const confirmed = confirm(`Are you sure you want to remove ${organizer.fullName} from this event?`);
    if (!confirmed) return;

    const toastId = eventFeedback.update.loading(`Removing ${organizer.fullName} from ${selectedEvent.name}`);

    try {
      const response = await fetch(`/api/admin/events/${selectedEvent.id}/organizers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizerId,
          reason: 'Removed via event details',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove organizer');
      }

      eventFeedback.update.success(`${organizer.fullName} removed from ${selectedEvent.name}`, String(toastId));
      
      // Refresh events to update the data
      await fetchEvents();
    } catch (err: unknown) {
      eventFeedback.update.error(`${organizer.fullName} removal`, err instanceof Error ? err.message : 'Failed to remove organizer', String(toastId));
    }
  };

  const handleEditEvent = () => {
    setIsEditOpen(true);
  };

  const handleDeleteEvent = () => {
    console.log('Delete button clicked for event:', selectedEvent?.id, selectedEvent?.name);
    setIsDeleteOpen(true);
  };

  const handleUpdateEvent = async (eventData: Record<string, unknown>) => {
    if (!selectedEvent) return;

    const toastId = eventFeedback.update.loading(selectedEvent.name);

    try {
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (data.success) {
        eventFeedback.update.success(selectedEvent.name, String(toastId));
        setIsEditOpen(false);
        await fetchEvents();
      } else {
        throw new Error(data.error || 'Failed to update event');
      }
    } catch (err: unknown) {
      eventFeedback.update.error(selectedEvent.name, err instanceof Error ? err.message : 'Failed to update event', String(toastId));
    }
  };

  const handleDeleteEventConfirm = async () => {
    if (!selectedEvent) return;

    const toastId = eventFeedback.delete.loading(selectedEvent.name);

    try {
      console.log('Attempting to delete event:', selectedEvent.id, selectedEvent.name);
      
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Delete response data:', data);

      if (data.success) {
        eventFeedback.delete.success(selectedEvent.name, String(toastId));
        setIsDeleteOpen(false);
        setSelectedEvent(null);
        await fetchEvents();
      } else {
        // Check if it's a warning (attendance records exist)
        if (response.status === 400 && data.error?.includes('attendance records')) {
          eventFeedback.delete.warning(selectedEvent.name, data.error);
        } else {
          throw new Error(data.error || 'Failed to delete event');
        }
      }
    } catch (err: unknown) {
      console.error('Delete event error:', err);
      eventFeedback.delete.error(selectedEvent.name, err instanceof Error ? err.message : 'Failed to delete event', String(toastId));
    }
  };

  const handleCreateEvent = async (eventData: Record<string, unknown>) => {
    const eventName = eventData.name as string || 'New Event';
    const toastId = eventFeedback.create.loading(eventName);

    try {
      // Extract organizer IDs from the form data
      const organizerIds = eventData.organizerIds as string[] || [];
      
      // Create the event first
      const eventPayload = {
        ...eventData,
        organizerIds: undefined, // Remove organizerIds from event creation payload
      };
      
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to create event');
      }
      
      // If organizers were selected, assign them to the event
      if (organizerIds.length > 0 && data.event?.id) {
        try {
          const assignRes = await fetch(`/api/admin/events/${data.event.id}/organizers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizerIds }),
          });
          
          if (!assignRes.ok) {
            const assignData = await assignRes.json();
            console.warn('Failed to assign organizers:', assignData.error);
            // Don't fail the entire operation, just warn
            toast.warning('Event created but organizer assignment failed');
          }
        } catch (assignErr) {
          console.warn('Error assigning organizers:', assignErr);
          toast.warning('Event created but organizer assignment failed');
        }
      }
      
      eventFeedback.create.success(eventName, String(toastId));
      setIsCreateOpen(false);
      await fetchEvents();
    } catch (err: unknown) {
      eventFeedback.create.error(eventName, err instanceof Error ? err.message : 'Failed to create event', String(toastId));
    }
  };

  const handleCreateSessionSubmit = async (sessionData: SessionFormData) => {
    if (!selectedEvent) return;

    const sessionName = sessionData.name || 'New Session';
    const toastId = sessionFeedback.create.loading(sessionName);

    try {
      // Get organizer IDs from the event's organizer assignments
      console.log('Event organizer assignments:', selectedEvent.organizerAssignments);
      const organizerIds = selectedEvent.organizerAssignments.length > 0 
        ? selectedEvent.organizerAssignments.map(assignment => assignment.organizer.id)
        : []; // Fallback to empty array if no organizers assigned

      console.log('Organizer IDs:', organizerIds);

      // Check if we have organizers assigned
      if (organizerIds.length === 0) {
        console.log('No organizers found, using placeholder organizer for testing');
        // For now, use a placeholder organizer ID to allow testing
        organizerIds.push('clx1234567890123456789012');
        genericFeedback.warning('No organizers assigned', 'Using placeholder organizer for testing.');
      }

      console.log('Proceeding with session creation with organizers:', organizerIds);

      const requestBody = {
        ...sessionData,
        eventId: selectedEvent.id,
        organizerIds: organizerIds,
      };

      console.log('Sending session creation request:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody, null, 2));

      console.log('Making API call to /api/admin/sessions...');
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      console.log('API call completed, response received');

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        const textResponse = await response.text();
        console.error('Raw response text:', textResponse);
        throw new Error('Invalid response format from server');
      }

      if (data.success) {
        sessionFeedback.create.success(sessionName, String(toastId));
        setIsCreateSessionOpen(false);
        await fetchEvents(); // Refresh to get updated session data
      } else {
        console.error('Session creation failed:', data);
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (err: unknown) {
      sessionFeedback.create.error(sessionName, err instanceof Error ? err.message : 'Failed to create session', String(toastId));
    }
  };

  const LeftPane = (
    <div className="border-r h-full overflow-hidden flex flex-col bg-white">
      <div className="p-4 border-b sticky top-0 bg-white z-10 space-y-3">
        {loading ? (
          <EventFiltersSkeleton />
        ) : (
          <>
            {/* Full-row search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setFilters((prev) => (prev.search === localSearch ? prev : { ...prev, search: localSearch }));
                    fetchEvents({ suppressLoading: true, searchOverride: localSearch });
                  }
                }}
                className="pl-10"
              />
            </div>
            {/* Filters row */}
            <div className="flex items-center gap-2">
              <Select value={filters.status} onValueChange={(value: string) => setFilters((f) => ({ ...f, status: value as 'all' | 'active' | 'inactive' | 'upcoming' | 'ended' }))}>
                <SelectTrigger className="h-10 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Now</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.dateRange} onValueChange={(value: string) => setFilters((f) => ({ ...f, dateRange: value as 'all' | 'today' | 'week' | 'month' | 'custom' }))}>
                <SelectTrigger className="h-10 w-[140px]">
                  <SelectValue placeholder="Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      <div className="flex-1 overflow-auto px-3 py-2">
        {loading ? (
          <EventsListSkeleton />
        ) : error ? (
          <EventErrorState 
            error={error} 
            onRetry={fetchEvents}
            className="mx-2"
          />
        ) : (
          <EventsList
            events={events}
            selectedEventId={selectedEvent?.id ?? null}
            onEventSelect={handleEventSelect}
            onViewDetails={handleEventSelect}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onAssignmentChange={fetchEvents}
            loading={loading}
          />
        )}
      </div>
      <div className="p-3 border-t bg-white">
        <Button className="w-full" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>
    </div>
  );

  const RightPane = (
    <div className="h-full overflow-auto bg-white">
      {loading ? (
        <div className="p-6">
          <EventDetailsSkeleton />
        </div>
      ) : !selectedEvent ? (
        <EventEmptyState variant="no-selection" className="p-6" />
      ) : (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-screen-xl">
          <EventDetailHeader
            event={selectedEvent}
            onEdit={handleEditEvent}
            onCreateSession={handleCreateSession}
          />
          {showOrganizerAssignments ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Organizer Assignments</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrganizerAssignments(false)}
                >
                  Back to Event Details
                </Button>
              </div>
              <OrganizerAssignments 
                eventId={selectedEvent.id}
                className="pb-6"
              />
            </div>
          ) : (
            <EventDetailTabs
              event={selectedEvent}
              onCreateSession={handleCreateSession}
              onViewSession={() => {}}
              onEditSession={() => {}}
              onDeleteSession={() => {}}
              onAssignOrganizer={() => setShowOrganizerAssignments(true)}
              onViewOrganizer={handleViewOrganizer}
              onRemoveOrganizer={handleRemoveOrganizer}
              className="pb-6"
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="h-[calc(100vh-220px)] grid grid-cols-1 lg:grid-cols-[360px_1fr] bg-white border rounded-md overflow-hidden relative">
        {LeftPane}
        {RightPane}
        <EventManagementLoadingOverlay isLoading={loading} />
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Create a new event with sessions and organizer assignments.</DialogDescription>
          </DialogHeader>
          <EventForm onSubmit={handleCreateEvent} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details and configuration.</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventForm 
              event={selectedEvent}
              onSubmit={handleUpdateEvent} 
              onCancel={() => setIsEditOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedEvent?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEventConfirm}>
              Delete Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Create a new session for &quot;{selectedEvent?.name}&quot; with time windows for attendance tracking.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <SessionForm
              eventId={selectedEvent.id}
              onSubmit={handleCreateSessionSubmit}
              onCancel={() => setIsCreateSessionOpen(false)}
              isSubmitting={isCreatingSession}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
