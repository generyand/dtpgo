import { Session, Event } from '@prisma/client';

/**
 * Extended session type with event information
 */
export interface SessionWithEvent extends Session {
  event: Event;
}

/**
 * Session with attendance count
 */
export interface SessionWithCounts extends Session {
  _count: {
    attendance: number;
  };
}

/**
 * Session with full event and attendance information
 */
export interface SessionWithDetails extends Session {
  event: Event;
  _count: {
    attendance: number;
  };
}

/**
 * Session time window status
 */
export type SessionStatus = 'upcoming' | 'active_time_in' | 'active_time_out' | 'ended' | 'inactive';

/**
 * Scan type based on current time and session windows
 */
export type ScanType = 'time_in' | 'time_out' | 'outside_window' | 'invalid';

/**
 * Session time window information
 */
export interface SessionTimeWindow {
  sessionId: string;
  sessionName: string;
  eventId: string;
  eventName: string;
  timeInStart: Date;
  timeInEnd: Date;
  timeOutStart: Date | null;
  timeOutEnd: Date | null;
  status: SessionStatus;
  currentScanType: ScanType;
  isActive: boolean;
  timeUntilStart?: number; // milliseconds
  timeUntilEnd?: number; // milliseconds
}

/**
 * Session statistics
 */
export interface SessionStatistics {
  totalAttendance: number;
  timeInCount: number;
  timeOutCount: number;
  attendanceRate: number;
  averageTimeIn?: Date;
  averageTimeOut?: Date;
  earliestTimeIn?: Date;
  latestTimeOut?: Date;
}

/**
 * Session creation input
 */
export interface CreateSessionInput {
  name: string;
  description?: string;
  eventId: string;
  timeInStart: string; // ISO string
  timeInEnd: string; // ISO string
  timeOutStart?: string; // ISO string
  timeOutEnd?: string; // ISO string
}

/**
 * Session update input
 */
export interface UpdateSessionInput {
  name?: string;
  description?: string;
  timeInStart?: string; // ISO string
  timeInEnd?: string; // ISO string
  timeOutStart?: string; // ISO string
  timeOutEnd?: string; // ISO string
  isActive?: boolean;
}

/**
 * Session query parameters
 */
export interface SessionQueryParams {
  page: number;
  limit: number;
  eventId?: string;
  search?: string;
  isActive?: boolean;
  sortBy: 'name' | 'timeInStart' | 'timeInEnd' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Session filter options
 */
export interface SessionFilterOptions {
  eventId?: string;
  status?: SessionStatus;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/**
 * Session list response
 */
export interface SessionListResponse {
  success: boolean;
  sessions: SessionWithDetails[];
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
 * Session detail response
 */
export interface SessionDetailResponse {
  success: boolean;
  session: SessionWithDetails & {
    attendance?: Array<{
      id: string;
      studentId: string;
      timeIn: Date | null;
      timeOut: Date | null;
      scanType: string;
      createdAt: Date;
      student: {
        id: string;
        studentIdNumber: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
  };
}

/**
 * Session creation response
 */
export interface SessionCreationResponse {
  success: boolean;
  message: string;
  session: SessionWithDetails;
}

/**
 * Session update response
 */
export interface SessionUpdateResponse {
  success: boolean;
  message: string;
  session: SessionWithDetails;
}

/**
 * Session deletion response
 */
export interface SessionDeletionResponse {
  success: boolean;
  message: string;
  session: SessionWithDetails;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Session time window validation
 */
export interface SessionTimeWindowValidation {
  isValid: boolean;
  errors: string[];
  overlappingSessions?: string[];
}

/**
 * Session conflict information
 */
export interface SessionConflict {
  sessionId: string;
  sessionName: string;
  conflictType: 'time_in_overlap' | 'time_out_overlap' | 'both_overlap';
  conflictDetails: {
    timeInOverlap?: boolean;
    timeOutOverlap?: boolean;
    overlappingPeriod?: {
      start: Date;
      end: Date;
    };
  };
}

/**
 * Session analytics data
 */
export interface SessionAnalytics {
  sessionId: string;
  sessionName: string;
  eventId: string;
  eventName: string;
  totalAttendance: number;
  timeInCount: number;
  timeOutCount: number;
  attendanceRate: number;
  averageAttendanceTime?: number; // minutes
  peakAttendanceTime?: Date;
  attendanceTrend: Array<{
    time: Date;
    count: number;
  }>;
}

/**
 * Session export data
 */
export interface SessionExportData {
  session: SessionWithDetails;
  attendance: Array<{
    studentIdNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    timeIn: Date | null;
    timeOut: Date | null;
    scanType: string;
    attendanceDuration?: number; // minutes
  }>;
  statistics: SessionStatistics;
  exportedAt: Date;
  exportedBy: string;
}

/**
 * Session notification data
 */
export interface SessionNotification {
  sessionId: string;
  sessionName: string;
  eventId: string;
  eventName: string;
  type: 'session_starting' | 'session_ending' | 'time_in_closing' | 'time_out_closing';
  message: string;
  scheduledFor: Date;
  isActive: boolean;
}

/**
 * Session reminder settings
 */
export interface SessionReminderSettings {
  sessionId: string;
  reminders: Array<{
    type: 'session_start' | 'time_in_close' | 'time_out_close' | 'session_end';
    minutesBefore: number;
    isEnabled: boolean;
  }>;
}

/**
 * Session bulk operations
 */
export interface SessionBulkOperation {
  operation: 'activate' | 'deactivate' | 'delete';
  sessionIds: string[];
  reason?: string;
}

/**
 * Session bulk operation result
 */
export interface SessionBulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    sessionId: string;
    error: string;
  }>;
  results: Array<{
    sessionId: string;
    success: boolean;
    message?: string;
  }>;
}
