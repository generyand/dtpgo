import { z } from 'zod';

/**
 * Base event validation schema
 */
export const eventBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Event name is required')
    .max(255, 'Event name must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .max(255, 'Location must be less than 255 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Event creation validation schema
 */
export const createEventSchema = eventBaseSchema.extend({
  startDate: z
    .string()
    .datetime('Invalid start date format')
    .refine(
      (date) => {
        const startDate = new Date(date);
        const now = new Date();
        // Allow events to start in the past (for testing) but not more than 1 year ago
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return startDate >= oneYearAgo;
      },
      {
        message: 'Start date cannot be more than 1 year in the past',
      }
    ),
  endDate: z
    .string()
    .datetime('Invalid end date format')
    .refine(
      (date) => {
        const endDate = new Date(date);
        const now = new Date();
        // Allow events to end in the past but not more than 1 year ago
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return endDate >= oneYearAgo;
      },
      {
        message: 'End date cannot be more than 1 year in the past',
      }
    ),
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * Event update validation schema
 */
export const updateEventSchema = eventBaseSchema
  .extend({
    startDate: z
      .string()
      .datetime('Invalid start date format')
      .optional()
      .refine(
        (date) => {
          if (!date) return true;
          const startDate = new Date(date);
          const now = new Date();
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return startDate >= oneYearAgo;
        },
        {
          message: 'Start date cannot be more than 1 year in the past',
        }
      ),
    endDate: z
      .string()
      .datetime('Invalid end date format')
      .optional()
      .refine(
        (date) => {
          if (!date) return true;
          const endDate = new Date(date);
          const now = new Date();
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return endDate >= oneYearAgo;
        },
        {
          message: 'End date cannot be more than 1 year in the past',
        }
      ),
    isActive: z.boolean().optional(),
  })
  .partial();

/**
 * Event query parameters validation schema
 */
export const eventQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  search: z.string().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  sortBy: z
    .enum(['name', 'startDate', 'endDate', 'createdAt', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
});

/**
 * Event ID parameter validation schema
 */
export const eventIdSchema = z.object({
  id: z.string().cuid('Invalid event ID format'),
});

/**
 * Event statistics query validation schema
 */
export const eventStatsQuerySchema = z.object({
  startDate: z
    .string()
    .datetime('Invalid start date format')
    .optional(),
  endDate: z
    .string()
    .datetime('Invalid end date format')
    .optional(),
  groupBy: z
    .enum(['day', 'week', 'month'])
    .optional()
    .default('day'),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

/**
 * TypeScript types inferred from schemas
 */
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventQueryParams = z.infer<typeof eventQuerySchema>;
export type EventIdParams = z.infer<typeof eventIdSchema>;
export type EventStatsQuery = z.infer<typeof eventStatsQuerySchema>;

/**
 * Event validation helper functions
 */
export const validateEventDates = (startDate: Date, endDate: Date): boolean => {
  return endDate > startDate;
};

export const validateEventName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 255;
};

export const validateEventDescription = (description?: string): boolean => {
  if (!description) return true;
  return description.length <= 1000;
};

export const validateEventLocation = (location?: string): boolean => {
  if (!location) return true;
  return location.length <= 255;
};

/**
 * Event business logic validation
 */
export const validateEventBusinessRules = (data: {
  startDate: Date;
  endDate: Date;
  name: string;
  existingEvents?: Array<{ id: string; name: string; startDate: Date; endDate: Date; isActive: boolean }>;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check date overlap with existing events
  if (data.existingEvents) {
    const overlappingEvents = data.existingEvents.filter(event => {
      if (!event.isActive) return false;
      return (
        (data.startDate >= event.startDate && data.startDate <= event.endDate) ||
        (data.endDate >= event.startDate && data.endDate <= event.endDate) ||
        (data.startDate <= event.startDate && data.endDate >= event.endDate)
      );
    });

    if (overlappingEvents.length > 0) {
      errors.push(`Event dates overlap with existing events: ${overlappingEvents.map(e => e.name).join(', ')}`);
    }
  }

  // Check if event duration is reasonable (not more than 30 days)
  const durationInDays = (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (durationInDays > 30) {
    errors.push('Event duration cannot exceed 30 days');
  }

  // Check if event is not too far in the future (not more than 2 years)
  const now = new Date();
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  if (data.startDate > twoYearsFromNow) {
    errors.push('Event cannot be scheduled more than 2 years in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
