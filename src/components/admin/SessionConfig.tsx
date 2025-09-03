'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TimeWindowConfig } from './TimeWindowConfig';
import { toast } from 'sonner';
import { Calendar, Users, Clock, Save, X, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';

// Validation schema for session creation
const sessionConfigSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(100, 'Session name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  eventId: z.string().min(1, 'Event selection is required'),
  timeInStart: z.string().min(1, 'Time-in start time is required'),
  timeInEnd: z.string().min(1, 'Time-in end time is required'),
  timeOutStart: z.string().optional(),
  timeOutEnd: z.string().optional(),
  assignedOrganizers: z.array(z.string()).optional(),
});

type SessionConfigFormData = z.infer<typeof sessionConfigSchema>;

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  isActive: boolean;
}

interface Organizer {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface SessionConfigProps {
  eventId?: string;
  sessionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SessionConfig({ eventId, sessionId, onSuccess, onCancel }: SessionConfigProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [assignedOrganizers, setAssignedOrganizers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!!sessionId);
  const router = useRouter();

  const form = useForm<SessionConfigFormData>({
    resolver: zodResolver(sessionConfigSchema),
    defaultValues: {
      name: '',
      description: '',
      eventId: eventId || '',
      timeInStart: '',
      timeInEnd: '',
      timeOutStart: '',
      timeOutEnd: '',
      assignedOrganizers: [],
    },
  });

  // Fetch events and organizers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, organizersResponse] = await Promise.all([
          fetch('/api/admin/events'),
          fetch('/api/admin/organizers'),
        ]);

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.events || []);
        }

        if (organizersResponse.ok) {
          const organizersData = await organizersResponse.json();
          setOrganizers(organizersData.organizers || []);
        }

        // If editing an existing session, fetch session data
        if (sessionId) {
          const sessionResponse = await fetch(`/api/admin/sessions/${sessionId}`);
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            form.reset({
              name: sessionData.name,
              description: sessionData.description || '',
              eventId: sessionData.eventId,
              timeInStart: sessionData.timeInStart ? new Date(sessionData.timeInStart).toISOString().slice(0, 16) : '',
              timeInEnd: sessionData.timeInEnd ? new Date(sessionData.timeInEnd).toISOString().slice(0, 16) : '',
              timeOutStart: sessionData.timeOutStart ? new Date(sessionData.timeOutStart).toISOString().slice(0, 16) : '',
              timeOutEnd: sessionData.timeOutEnd ? new Date(sessionData.timeOutEnd).toISOString().slice(0, 16) : '',
              assignedOrganizers: sessionData.assignedOrganizers || [],
            });
            setAssignedOrganizers(sessionData.assignedOrganizers || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };

    fetchData();
  }, [sessionId, form]);

  const onSubmit = async (data: SessionConfigFormData) => {
    setLoading(true);
    try {
      const sessionData = {
        ...data,
        assignedOrganizers,
      };

      const url = isEditing ? `/api/admin/sessions/${sessionId}` : '/api/admin/sessions';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(isEditing ? 'Session updated successfully' : 'Session created successfully');
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/events');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save session');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganizer = (organizerId: string) => {
    if (!assignedOrganizers.includes(organizerId)) {
      const updated = [...assignedOrganizers, organizerId];
      setAssignedOrganizers(updated);
      form.setValue('assignedOrganizers', updated);
    }
  };

  const handleRemoveOrganizer = (organizerId: string) => {
    const updated = assignedOrganizers.filter(id => id !== organizerId);
    setAssignedOrganizers(updated);
    form.setValue('assignedOrganizers', updated);
  };

  const getOrganizerName = (organizerId: string) => {
    const organizer = organizers.find(o => o.id === organizerId);
    return organizer?.fullName || organizer?.email || 'Unknown Organizer';
  };

  const availableOrganizers = organizers.filter(o => !assignedOrganizers.includes(o.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Edit Session' : 'Create New Session'}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update the session configuration and time windows.'
              : 'Configure a new attendance session with time windows and organizer assignments.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Session Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Session Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Morning Session, Workshop A"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventId" className="text-sm font-medium">
                  Event *
                </Label>
                <Select
                  value={form.watch('eventId')}
                  onValueChange={(value) => form.setValue('eventId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events
                      .filter(event => event.isActive)
                      .map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.eventId && (
                  <p className="text-sm text-red-600">{form.formState.errors.eventId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Optional description for this session..."
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Time Window Configuration */}
            <TimeWindowConfig />

            {/* Organizer Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Organizer Assignment
                </CardTitle>
                <CardDescription>
                  Assign organizers to manage this session. Organizers will be able to scan QR codes and manage attendance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Organizer */}
                {availableOrganizers.length > 0 && (
                  <div className="flex gap-2">
                    <Select onValueChange={handleAddOrganizer}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select an organizer to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOrganizers.map((organizer) => (
                          <SelectItem key={organizer.id} value={organizer.id}>
                            {organizer.fullName || organizer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Assigned Organizers */}
                {assignedOrganizers.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Assigned Organizers</Label>
                    <div className="flex flex-wrap gap-2">
                      {assignedOrganizers.map((organizerId) => (
                        <Badge
                          key={organizerId}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          <Users className="h-3 w-3" />
                          {getOrganizerName(organizerId)}
                          <button
                            type="button"
                            onClick={() => handleRemoveOrganizer(organizerId)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {assignedOrganizers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No organizers assigned to this session</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel || (() => router.back())}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Session' : 'Create Session'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
