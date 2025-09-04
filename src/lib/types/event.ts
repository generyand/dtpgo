import { Event, Session } from '@prisma/client';

/**
 * Event with session and organizer information
 */
export interface EventWithDetails extends Event {
  sessions: Session[];
  organizerAssignments: Array<{
    id: string;
    organizer: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      isActive: boolean;
    };
    assignedAt: Date;
    assignedBy: string;
  }>;
  _count: {
    sessions: number;
    organizerAssignments: number;
    attendance: number;
  };
}

/**
 * Event creation input
 */
export interface CreateEventInput {
  name: string;
  description?: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location?: string;
}

/**
 * Event update input
 */
export interface UpdateEventInput {
  name?: string;
  description?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  location?: string;
  isActive?: boolean;
}

/**
 * Event query parameters
 */
export interface EventQueryParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  sortBy: 'name' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Event list response
 */
export interface EventListResponse {
  success: boolean;
  events: EventWithDetails[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Event detail response
 */
export interface EventDetailResponse {
  success: boolean;
  event: EventWithDetails;
}

/**
 * Event creation response
 */
export interface EventCreationResponse {
  success: boolean;
  message: string;
  event: EventWithDetails;
}

/**
 * Event update response
 */
export interface EventUpdateResponse {
  success: boolean;
  message: string;
  event: EventWithDetails;
}

/**
 * Event deletion response
 */
export interface EventDeletionResponse {
  success: boolean;
  message: string;
  event: EventWithDetails;
}

/**
 * Event statistics
 */
export interface EventStatistics {
  totalEvents: number;
  activeEvents: number;
  totalSessions: number;
  totalOrganizers: number;
  totalAttendance: number;
  upcomingEvents: number;
  endedEvents: number;
}

/**
 * Event analytics data
 */
export interface EventAnalytics {
  eventId: string;
  eventName: string;
  totalAttendance: number;
  attendanceBySession: Array<{
    sessionId: string;
    sessionName: string;
    attendanceCount: number;
  }>;
  attendanceTrend: Array<{
    date: string;
    count: number;
  }>;
  organizerPerformance: Array<{
    organizerId: string;
    organizerName: string;
    sessionsManaged: number;
    attendanceRecorded: number;
  }>;
}

/**
 * Event export data
 */
export interface EventExportData {
  event: EventWithDetails;
  sessions: Array<{
    id: string;
    name: string;
    timeInStart: Date;
    timeInEnd: Date;
    timeOutStart?: Date;
    timeOutEnd?: Date;
    attendanceCount: number;
  }>;
  organizers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    assignedAt: Date;
  }>;
  statistics: EventStatistics;
  exportedAt: Date;
  exportedBy: string;
}

/**
 * Event filter options
 */
export interface EventFilterOptions {
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  search?: string;
}

/**
 * Event validation result
 */
export interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Event conflict information
 */
export interface EventConflict {
  eventId: string;
  eventName: string;
  conflictType: 'date_overlap' | 'location_conflict' | 'name_duplicate';
  conflictDetails: {
    conflictingEventId: string;
    conflictingEventName: string;
    conflictPeriod?: {
      start: Date;
      end: Date;
    };
  };
}

/**
 * Event reminder settings
 */
export interface EventReminderSettings {
  eventId: string;
  reminders: Array<{
    type: 'event_start' | 'event_end' | 'session_start' | 'session_end';
    minutesBefore: number;
    isEnabled: boolean;
  }>;
}

/**
 * Event bulk operations
 */
export interface EventBulkOperation {
  operation: 'activate' | 'deactivate' | 'delete';
  eventIds: string[];
  reason?: string;
}

/**
 * Event bulk operation result
 */
export interface EventBulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    eventId: string;
    error: string;
  }>;
  results: Array<{
    eventId: string;
    success: boolean;
    message?: string;
  }>;
}
