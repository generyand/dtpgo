'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
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
  const [filters, setFilters] = useState<EventFiltersModel>({
    search: '',
    status: 'all',
    dateRange: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: filters.search || '',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      if (filters.status !== 'all') params.set('isActive', filters.status === 'active' ? 'true' : 'false');

      const response = await fetch(`/api/admin/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load events');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to load events');

      setEvents(data.events as EventWithDetails[]);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
      
      if (!selectedEvent && data.events.length > 0) {
        setSelectedEvent(data.events[0]);
      } else if (selectedEvent) {
        const updated = data.events.find((e: EventWithDetails) => e.id === selectedEvent.id);
        if (updated) setSelectedEvent(updated);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.sortBy, filters.sortOrder]);

  const handleEventSelect = (event: EventWithDetails) => setSelectedEvent(event);

  const handleCreateSession = () => {
    // TODO: Implement session creation
    toast.info('Session creation coming soon');
  };

  const handleEditEvent = () => {
    setIsEditOpen(true);
  };

  const handleDeleteEvent = () => {
    setIsDeleteOpen(true);
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!selectedEvent) return;

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
        toast.success('Event updated successfully');
        setIsEditOpen(false);
        await fetchEvents();
      } else {
        throw new Error(data.error || 'Failed to update event');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update event');
    }
  };

  const handleDeleteEventConfirm = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Event deleted successfully');
        setIsDeleteOpen(false);
        setSelectedEvent(null);
        await fetchEvents();
      } else {
        throw new Error(data.error || 'Failed to delete event');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete event');
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Failed to create event');
      }
      toast.success('Event created successfully');
      setIsCreateOpen(false);
      await fetchEvents();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create event');
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
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            {/* Filters row */}
            <div className="flex items-center gap-2">
              <Select value={filters.status} onValueChange={(value: any) => setFilters((f) => ({ ...f, status: value }))}>
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
              <Select value={filters.dateRange} onValueChange={(value: any) => setFilters((f) => ({ ...f, dateRange: value }))}>
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
          <EventDetailTabs
            event={selectedEvent}
            onCreateSession={handleCreateSession}
            onViewSession={() => {}}
            onEditSession={() => {}}
            onDeleteSession={() => {}}
            onAssignOrganizer={() => {}}
            onViewOrganizer={() => {}}
            onRemoveOrganizer={() => {}}
            className="pb-6"
          />
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
              Are you sure you want to delete "{selectedEvent?.name}"? This action cannot be undone.
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
    </>
  );
}
