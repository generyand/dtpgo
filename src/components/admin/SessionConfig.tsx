'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TimeWindowConfig } from './TimeWindowConfig';
import { toast } from 'sonner';
import { X, Plus, Users } from 'lucide-react';
import { z } from 'zod';
import { SessionFormLayout, FormSection, FormGrid } from '@/components/admin/SessionFormLayout';
import { SessionFormState, useSessionFormStateActions } from '@/components/admin/SessionFormState';
import { SubmissionStatus } from '@/components/admin/SessionSubmission';
import { SessionFormActions } from '@/components/admin/SessionFormActions';

// Validation schema for session creation
const sessionConfigSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(100, 'Session name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  eventId: z.string().min(1, 'Event selection is required'),
  timeInStart: z.date({ message: 'Time-in start time is required' }),
  timeInEnd: z.date({ message: 'Time-in end time is required' }),
  timeOutStart: z.date().optional(),
  timeOutEnd: z.date().optional(),
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
  const [isEditing] = useState(!!sessionId);
  const router = useRouter();

  const form = useForm<SessionConfigFormData>({
    resolver: zodResolver(sessionConfigSchema),
    defaultValues: {
      name: '',
      description: '',
      eventId: eventId || '',
      timeInStart: new Date(),
      timeInEnd: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      timeOutStart: undefined,
      timeOutEnd: undefined,
      assignedOrganizers: [],
    },
  });

  // Session form state actions
  const { setDirty, setStatus } = useSessionFormStateActions();

  // Track dirty state and map to context
  useEffect(() => {
    setDirty(form.formState.isDirty);
  }, [form.formState.isDirty, setDirty]);

  // Fetch events and organizers on component mount
  useEffect(() => {
    const fetchData = async () => {
      setStatus('loading');
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
              timeInStart: sessionData.timeInStart ? new Date(sessionData.timeInStart) : new Date(),
              timeInEnd: sessionData.timeInEnd ? new Date(sessionData.timeInEnd) : new Date(Date.now() + 60 * 60 * 1000),
              timeOutStart: sessionData.timeOutStart ? new Date(sessionData.timeOutStart) : undefined,
              timeOutEnd: sessionData.timeOutEnd ? new Date(sessionData.timeOutEnd) : undefined,
              assignedOrganizers: sessionData.assignedOrganizers || [],
            });
            setAssignedOrganizers(sessionData.assignedOrganizers || []);
          }
        }
        setStatus('idle');
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setStatus('error', 'Failed to load events or organizers. Please try again.');
      }
    };

    fetchData();
  }, [sessionId, form, setStatus]);

  const onSubmit = async (data: SessionConfigFormData) => {
    setStatus('submitting');
    try {
      const sessionData = {
        ...data,
        timeInStart: data.timeInStart.toISOString(),
        timeInEnd: data.timeInEnd.toISOString(),
        timeOutStart: data.timeOutStart?.toISOString(),
        timeOutEnd: data.timeOutEnd?.toISOString(),
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
        await response.json();
        toast.success(isEditing ? 'Session updated successfully' : 'Session created successfully');
        setStatus('success');
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/events');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save session');
        setStatus('error', error.message || 'Failed to save session');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
      setStatus('error', 'Failed to save session');
    } finally {
      // Leave status as set by success/error for UI to reflect
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
    <SessionFormState>
      <SessionFormLayout title={isEditing ? 'Edit Session' : 'Create New Session'} subtitle={isEditing ? 'Update the session configuration and time windows.' : 'Configure a new attendance session with time windows and organizer assignments.'}>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormGrid>
              <FormSection title="Basic Information" description="Name your session and select the parent event" required>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Session Name *</Label>
                    <Input id="name" placeholder="e.g., Morning Session, Workshop A" {...form.register('name')} />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventId">Event *</Label>
                    <Select value={form.watch('eventId')} onValueChange={(value) => form.setValue('eventId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.filter(event => event.isActive).map((event) => (
                          <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.eventId && (
                      <p className="text-sm text-destructive">{form.formState.errors.eventId.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Optional description for this session..." rows={3} {...form.register('description')} />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>
              </FormSection>

              <FormSection title="Time Windows" description="Configure time-in and time-out windows">
                <TimeWindowConfig />
              </FormSection>
            </FormGrid>

            <FormSection title="Organizer Assignment" description="Assign organizers to manage this session.">
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

              {assignedOrganizers.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assigned Organizers</Label>
                  <div className="flex flex-wrap gap-2">
                    {assignedOrganizers.map((organizerId) => (
                      <Badge key={organizerId} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        <Users className="h-3 w-3" />
                        {getOrganizerName(organizerId)}
                        <button type="button" onClick={() => handleRemoveOrganizer(organizerId)} className="ml-1 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No organizers assigned to this session</p>
                </div>
              )}
                         </FormSection>
 
             <SubmissionStatus onCreateAnother={() => {
               form.reset();
               setAssignedOrganizers([]);
               setStatus('idle');
             }} onClose={onCancel || (() => router.back())} />
 
                          <SessionFormActions
               onReset={() => {
                 form.reset();
                 setAssignedOrganizers([]);
                 setStatus('idle');
               }}
               onCancel={onCancel || (() => router.back())}
               onSave={form.handleSubmit(onSubmit)}
               isSubmitting={status === 'submitting'}
               hasUnsavedChanges={form.formState.isDirty}
               resetLabel="Reset Form"
               cancelLabel="Cancel"
               saveLabel={isEditing ? 'Update Session' : 'Create Session'}
               resetConfirmationTitle="Reset Session Form"
               resetConfirmationMessage="Are you sure you want to reset the form? All entered session data will be lost."
               unsavedChangesTitle="Unsaved Session Changes"
               unsavedChangesMessage="You have unsaved changes to this session. Are you sure you want to leave without saving?"
             />
          </form>
        </FormProvider>
      </SessionFormLayout>
    </SessionFormState>
  );
}
