import { z } from 'zod';

/**
 * Base session validation schema
 */
export const sessionBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Session name is required')
    .max(255, 'Session name must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

/**
 * Session time window validation schema
 */
export const sessionTimeWindowSchema = z.object({
  timeInStart: z
    .string()
    .datetime('Invalid time-in start format'),
  timeInEnd: z
    .string()
    .datetime('Invalid time-in end format'),
  timeOutStart: z
    .string()
    .datetime('Invalid time-out start format')
    .optional(),
  timeOutEnd: z
    .string()
    .datetime('Invalid time-out end format')
    .optional(),
}).refine(
  (data) => {
    const timeInStart = new Date(data.timeInStart);
    const timeInEnd = new Date(data.timeInEnd);
    return timeInEnd > timeInStart;
  },
  {
    message: 'Time-in end must be after time-in start',
    path: ['timeInEnd'],
  }
).refine(
  (data) => {
    if (data.timeOutStart && data.timeOutEnd) {
      const timeOutStart = new Date(data.timeOutStart);
      const timeOutEnd = new Date(data.timeOutEnd);
      return timeOutEnd > timeOutStart;
    }
    return true;
  },
  {
    message: 'Time-out end must be after time-out start',
    path: ['timeOutEnd'],
  }
).refine(
  (data) => {
    const timeInEnd = new Date(data.timeInEnd);
    if (data.timeOutStart) {
      const timeOutStart = new Date(data.timeOutStart);
      return timeOutStart >= timeInEnd;
    }
    return true;
  },
  {
    message: 'Time-out start must be after or equal to time-in end',
    path: ['timeOutStart'],
  }
);

/**
 * Session creation validation schema
 */
export const createSessionSchema = sessionBaseSchema
  .extend({
    eventId: z.string().cuid('Invalid event ID format'),
  })
  .merge(sessionTimeWindowSchema);

/**
 * Session update validation schema
 */
export const updateSessionSchema = sessionBaseSchema
  .extend({
    timeInStart: z
      .string()
      .datetime('Invalid time-in start format')
      .optional(),
    timeInEnd: z
      .string()
      .datetime('Invalid time-in end format')
      .optional(),
    timeOutStart: z
      .string()
      .datetime('Invalid time-out start format')
      .optional(),
    timeOutEnd: z
      .string()
      .datetime('Invalid time-out end format')
      .optional(),
    isActive: z.boolean().optional(),
  })
  .partial();

/**
 * Session query parameters validation schema
 */
export const sessionQuerySchema = z.object({
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
  eventId: z.string().cuid('Invalid event ID format').optional(),
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
    .enum(['name', 'timeInStart', 'timeInEnd', 'createdAt', 'updatedAt'])
    .optional()
    .default('timeInStart'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc'),
});

/**
 * Session ID parameter validation schema
 */
export const sessionIdSchema = z.object({
  id: z.string().cuid('Invalid session ID format'),
});

/**
 * Session scan type validation schema
 */
export const sessionScanTypeSchema = z.object({
  scanType: z.enum(['time_in', 'time_out'], {
    message: 'Scan type must be either "time_in" or "time_out"',
  }),
});

/**
 * Session time window query validation schema
 */
export const sessionTimeWindowQuerySchema = z.object({
  eventId: z.string().cuid('Invalid event ID format'),
  date: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionQueryParams = z.infer<typeof sessionQuerySchema>;
export type SessionIdParams = z.infer<typeof sessionIdSchema>;
export type SessionScanType = z.infer<typeof sessionScanTypeSchema>;
export type SessionTimeWindowQuery = z.infer<typeof sessionTimeWindowQuerySchema>;

/**
 * Session validation helper functions
 */
export const validateSessionTimeWindows = (data: {
  timeInStart: Date;
  timeInEnd: Date;
  timeOutStart?: Date;
  timeOutEnd?: Date;
}): boolean => {
  // Time-in window validation
  if (data.timeInEnd <= data.timeInStart) {
    return false;
  }

  // Time-out window validation (if provided)
  if (data.timeOutStart && data.timeOutEnd) {
    if (data.timeOutEnd <= data.timeOutStart) {
      return false;
    }
    if (data.timeOutStart < data.timeInEnd) {
      return false;
    }
  }

  return true;
};

export const validateSessionName = (name: string): boolean => {
  return name.length >= 1 && name.length <= 255;
};

export const validateSessionDescription = (description?: string): boolean => {
  if (!description) return true;
  return description.length <= 1000;
};

/**
 * Session business logic validation
 */
export const validateSessionBusinessRules = (data: {
  eventId: string;
  timeInStart: Date;
  timeInEnd: Date;
  timeOutStart?: Date;
  timeOutEnd?: Date;
  existingSessions?: Array<{
    id: string;
    name: string;
    timeInStart: Date;
    timeInEnd: Date;
    timeOutStart?: Date;
    timeOutEnd?: Date;
    isActive: boolean;
  }>;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check time window overlap with existing sessions
  if (data.existingSessions) {
    const overlappingSessions = data.existingSessions.filter(session => {
      if (!session.isActive) return false;
      
      // Check if time-in windows overlap
      const timeInOverlap = (
        (data.timeInStart >= session.timeInStart && data.timeInStart < session.timeInEnd) ||
        (data.timeInEnd > session.timeInStart && data.timeInEnd <= session.timeInEnd) ||
        (data.timeInStart <= session.timeInStart && data.timeInEnd >= session.timeInEnd)
      );

      // Check if time-out windows overlap (if both have time-out windows)
      let timeOutOverlap = false;
      if (data.timeOutStart && data.timeOutEnd && session.timeOutStart && session.timeOutEnd) {
        timeOutOverlap = (
          (data.timeOutStart >= session.timeOutStart && data.timeOutStart < session.timeOutEnd) ||
          (data.timeOutEnd > session.timeOutStart && data.timeOutEnd <= session.timeOutEnd) ||
          (data.timeOutStart <= session.timeOutStart && data.timeOutEnd >= session.timeOutEnd)
        );
      }

      return timeInOverlap || timeOutOverlap;
    });

    if (overlappingSessions.length > 0) {
      errors.push(`Session time windows overlap with existing sessions: ${overlappingSessions.map(s => s.name).join(', ')}`);
    }
  }

  // Check if session duration is reasonable (not more than 8 hours for time-in window)
  const timeInDurationInHours = (data.timeInEnd.getTime() - data.timeInStart.getTime()) / (1000 * 60 * 60);
  if (timeInDurationInHours > 8) {
    errors.push('Time-in window cannot exceed 8 hours');
  }

  // Check if time-out window duration is reasonable (not more than 8 hours)
  if (data.timeOutStart && data.timeOutEnd) {
    const timeOutDurationInHours = (data.timeOutEnd.getTime() - data.timeOutStart.getTime()) / (1000 * 60 * 60);
    if (timeOutDurationInHours > 8) {
      errors.push('Time-out window cannot exceed 8 hours');
    }
  }

  // Check if session is not too far in the future (not more than 2 years)
  const now = new Date();
  const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  if (data.timeInStart > twoYearsFromNow) {
    errors.push('Session cannot be scheduled more than 2 years in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Determine scan type based on current time and session time windows
 */
export const determineScanType = (data: {
  currentTime: Date;
  timeInStart: Date;
  timeInEnd: Date;
  timeOutStart?: Date;
  timeOutEnd?: Date;
}): 'time_in' | 'time_out' | 'outside_window' | 'invalid' => {
  const { currentTime, timeInStart, timeInEnd, timeOutStart, timeOutEnd } = data;

  // Check if current time is within time-in window
  if (currentTime >= timeInStart && currentTime <= timeInEnd) {
    return 'time_in';
  }

  // Check if current time is within time-out window (if it exists)
  if (timeOutStart && timeOutEnd && currentTime >= timeOutStart && currentTime <= timeOutEnd) {
    return 'time_out';
  }

  // Check if current time is before time-in window
  if (currentTime < timeInStart) {
    return 'outside_window';
  }

  // Check if current time is after time-out window (or after time-in window if no time-out window)
  if (timeOutEnd) {
    if (currentTime > timeOutEnd) {
      return 'outside_window';
    }
  } else {
    if (currentTime > timeInEnd) {
      return 'outside_window';
    }
  }

  return 'invalid';
};
