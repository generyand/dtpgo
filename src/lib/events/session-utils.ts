import { Session, Event } from '@prisma/client';

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
 * Session with event information
 */
export interface SessionWithEvent extends Session {
  event: Event;
}

/**
 * Get current session status based on time windows
 */
export function getSessionStatus(
  session: Session,
  currentTime: Date = new Date()
): SessionStatus {
  if (!session.isActive) {
    return 'inactive';
  }

  const { timeInStart, timeInEnd, timeOutStart, timeOutEnd } = session;

  // Check if current time is within time-in window
  if (currentTime >= timeInStart && currentTime <= timeInEnd) {
    return 'active_time_in';
  }

  // Check if current time is within time-out window (if it exists)
  if (timeOutStart && timeOutEnd && currentTime >= timeOutStart && currentTime <= timeOutEnd) {
    return 'active_time_out';
  }

  // Check if current time is before time-in window
  if (currentTime < timeInStart) {
    return 'upcoming';
  }

  // Check if current time is after time-out window (or after time-in window if no time-out window)
  if (timeOutEnd) {
    if (currentTime > timeOutEnd) {
      return 'ended';
    }
  } else {
    if (currentTime > timeInEnd) {
      return 'ended';
    }
  }

  return 'inactive';
}

/**
 * Determine scan type based on current time and session time windows
 */
export function determineScanType(
  session: Session,
  currentTime: Date = new Date()
): ScanType {
  if (!session.isActive) {
    return 'invalid';
  }

  const { timeInStart, timeInEnd, timeOutStart, timeOutEnd } = session;

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
}

/**
 * Get session time window information
 */
export function getSessionTimeWindow(
  session: SessionWithEvent,
  currentTime: Date = new Date()
): SessionTimeWindow {
  const status = getSessionStatus(session, currentTime);
  const currentScanType = determineScanType(session, currentTime);

  const timeWindow: SessionTimeWindow = {
    sessionId: session.id,
    sessionName: session.name,
    eventId: session.eventId,
    eventName: session.event.name,
    timeInStart: session.timeInStart,
    timeInEnd: session.timeInEnd,
    timeOutStart: session.timeOutStart,
    timeOutEnd: session.timeOutEnd,
    status,
    currentScanType,
    isActive: session.isActive,
  };

  // Calculate time until start/end
  if (status === 'upcoming') {
    timeWindow.timeUntilStart = session.timeInStart.getTime() - currentTime.getTime();
  } else if (status === 'active_time_in') {
    timeWindow.timeUntilEnd = session.timeInEnd.getTime() - currentTime.getTime();
  } else if (status === 'active_time_out' && session.timeOutEnd) {
    timeWindow.timeUntilEnd = session.timeOutEnd.getTime() - currentTime.getTime();
  }

  return timeWindow;
}

/**
 * Get active sessions for a specific time
 */
export function getActiveSessions(
  sessions: SessionWithEvent[],
  currentTime: Date = new Date()
): SessionWithEvent[] {
  return sessions.filter(session => {
    if (!session.isActive) return false;
    
    const status = getSessionStatus(session, currentTime);
    return status === 'active_time_in' || status === 'active_time_out';
  });
}

/**
 * Get upcoming sessions for a specific time
 */
export function getUpcomingSessions(
  sessions: SessionWithEvent[],
  currentTime: Date = new Date()
): SessionWithEvent[] {
  return sessions.filter(session => {
    if (!session.isActive) return false;
    
    const status = getSessionStatus(session, currentTime);
    return status === 'upcoming';
  });
}

/**
 * Get ended sessions for a specific time
 */
export function getEndedSessions(
  sessions: SessionWithEvent[],
  currentTime: Date = new Date()
): SessionWithEvent[] {
  return sessions.filter(session => {
    if (!session.isActive) return false;
    
    const status = getSessionStatus(session, currentTime);
    return status === 'ended';
  });
}

/**
 * Check if a session is currently active for scanning
 */
export function isSessionActiveForScanning(
  session: Session,
  currentTime: Date = new Date()
): boolean {
  if (!session.isActive) return false;
  
  const scanType = determineScanType(session, currentTime);
  return scanType === 'time_in' || scanType === 'time_out';
}

/**
 * Get the next active session
 */
export function getNextActiveSession(
  sessions: SessionWithEvent[],
  currentTime: Date = new Date()
): SessionWithEvent | null {
  const activeSessions = getActiveSessions(sessions, currentTime);
  if (activeSessions.length > 0) {
    return activeSessions[0]; // Return first active session
  }

  const upcomingSessions = getUpcomingSessions(sessions, currentTime);
  if (upcomingSessions.length > 0) {
    // Sort by time-in start and return the earliest
    return upcomingSessions.sort((a, b) => a.timeInStart.getTime() - b.timeInStart.getTime())[0];
  }

  return null;
}

/**
 * Format time duration in human-readable format
 */
export function formatTimeDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format time until session starts/ends
 */
export function formatTimeUntil(targetTime: Date, currentTime: Date = new Date()): string {
  const diff = targetTime.getTime() - currentTime.getTime();
  
  if (diff <= 0) {
    return 'Now';
  }
  
  return `in ${formatTimeDuration(diff)}`;
}

/**
 * Check if two sessions have overlapping time windows
 */
export function hasOverlappingTimeWindows(session1: Session, session2: Session): boolean {
  // Check time-in window overlap
  const timeInOverlap = (
    (session1.timeInStart >= session2.timeInStart && session1.timeInStart < session2.timeInEnd) ||
    (session1.timeInEnd > session2.timeInStart && session1.timeInEnd <= session2.timeInEnd) ||
    (session1.timeInStart <= session2.timeInStart && session1.timeInEnd >= session2.timeInEnd)
  );

  // Check time-out window overlap (if both sessions have time-out windows)
  let timeOutOverlap = false;
  if (session1.timeOutStart && session1.timeOutEnd && session2.timeOutStart && session2.timeOutEnd) {
    timeOutOverlap = (
      (session1.timeOutStart >= session2.timeOutStart && session1.timeOutStart < session2.timeOutEnd) ||
      (session1.timeOutEnd > session2.timeOutStart && session1.timeOutEnd <= session2.timeOutEnd) ||
      (session1.timeOutStart <= session2.timeOutStart && session1.timeOutEnd >= session2.timeOutEnd)
    );
  }

  return timeInOverlap || timeOutOverlap;
}

/**
 * Validate session time windows
 */
export function validateSessionTimeWindows(session: Session): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if time-in end is after time-in start
  if (session.timeInEnd <= session.timeInStart) {
    errors.push('Time-in end must be after time-in start');
  }

  // Check if time-out window is valid (if provided)
  if (session.timeOutStart && session.timeOutEnd) {
    if (session.timeOutEnd <= session.timeOutStart) {
      errors.push('Time-out end must be after time-out start');
    }
    if (session.timeOutStart < session.timeInEnd) {
      errors.push('Time-out start must be after or equal to time-in end');
    }
  }

  // Check if session duration is reasonable (not more than 8 hours for time-in window)
  const timeInDurationInHours = (session.timeInEnd.getTime() - session.timeInStart.getTime()) / (1000 * 60 * 60);
  if (timeInDurationInHours > 8) {
    errors.push('Time-in window cannot exceed 8 hours');
  }

  // Check if time-out window duration is reasonable (not more than 8 hours)
  if (session.timeOutStart && session.timeOutEnd) {
    const timeOutDurationInHours = (session.timeOutEnd.getTime() - session.timeOutStart.getTime()) / (1000 * 60 * 60);
    if (timeOutDurationInHours > 8) {
      errors.push('Time-out window cannot exceed 8 hours');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get session statistics
 */
export function getSessionStatistics(session: SessionWithEvent & { attendance?: any[] }): {
  totalAttendance: number;
  timeInCount: number;
  timeOutCount: number;
  attendanceRate: number;
} {
  const attendance = session.attendance || [];
  
  const timeInCount = attendance.filter(a => a.scanType === 'time_in').length;
  const timeOutCount = attendance.filter(a => a.scanType === 'time_out').length;
  
  return {
    totalAttendance: attendance.length,
    timeInCount,
    timeOutCount,
    attendanceRate: attendance.length > 0 ? (timeInCount / attendance.length) * 100 : 0,
  };
}
