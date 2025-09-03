'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event';
import { EventWithDetails } from '@/lib/types/event';

// Form data type
type EventFormData = {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isActive: boolean;
};

interface EventFormProps {
  event?: EventWithDetails;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!event;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EventFormData>({
    defaultValues: {
      name: event?.name || '',
      description: event?.description || undefined,
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event?.location || undefined,
      isActive: event?.isActive ?? true,
    },
  });

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  // Auto-adjust end date if it's before start date
  useEffect(() => {
    if (watchedStartDate && watchedEndDate) {
      const startDate = new Date(watchedStartDate);
      const endDate = new Date(watchedEndDate);
      
      if (endDate <= startDate) {
        // Set end date to 1 hour after start date
        const newEndDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        setValue('endDate', newEndDate.toISOString().slice(0, 16));
      }
    }
  }, [watchedStartDate, watchedEndDate, setValue]);

  const handleFormSubmit = handleSubmit(async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert datetime-local format to ISO string
      const formData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleReset = () => {
    if (event) {
      reset({
        name: event.name,
        description: event.description || undefined,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        location: event.location || undefined,
        isActive: event.isActive,
      });
    } else {
      reset();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Event Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Event Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter event name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter event description (optional)"
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date & Time *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="startDate"
              type="datetime-local"
              {...register('startDate')}
              className={`pl-10 ${errors.startDate ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date & Time *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="endDate"
              type="datetime-local"
              {...register('endDate')}
              className={`pl-10 ${errors.endDate ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="location"
            {...register('location')}
            placeholder="Enter event location (optional)"
            className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      {/* Status (only for editing) */}
      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              {...register('isActive')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              Event is active
            </Label>
          </div>
          {errors.isActive && (
            <p className="text-sm text-red-500">{errors.isActive.message}</p>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}
