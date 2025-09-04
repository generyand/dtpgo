import { prisma } from '@/lib/db/client';
import { ScanActionType, DuplicateCheckResult, AttendanceRecord } from '@/lib/types/scanning';

/**
 * Configuration for duplicate scan prevention
 */
export interface DuplicateCheckConfig {
  /** Minimum time between scans in minutes */
  minTimeBetweenScans: number;
  /** Allow multiple time-in scans for the same session */
  allowMultipleTimeIn: boolean;
  /** Allow multiple time-out scans for the same session */
  allowMultipleTimeOut: boolean;
  /** Maximum number of scans per student per session */
  maxScansPerSession: number;
  /** Time window for considering scans as duplicates (in minutes) */
  duplicateTimeWindow: number;
}

/**
 * Default configuration for duplicate scan prevention
 */
export const DEFAULT_DUPLICATE_CONFIG: DuplicateCheckConfig = {
  minTimeBetweenScans: 1, // 1 minute minimum between scans
  allowMultipleTimeIn: false, // Only one time-in per session
  allowMultipleTimeOut: false, // Only one time-out per session
  maxScansPerSession: 2, // Maximum 2 scans (time-in + time-out)
  duplicateTimeWindow: 5, // 5 minutes window for duplicate detection
};

/**
 * Check for duplicate scans for a student in a session
 */
export async function checkDuplicateScan(
  studentId: string,
  sessionId: string,
  scanType: ScanActionType,
  config: DuplicateCheckConfig = DEFAULT_DUPLICATE_CONFIG
): Promise<DuplicateCheckResult> {
  try {
    // Get all attendance records for this student in this session
    const existingRecords = await prisma.attendance.findMany({
      where: {
        studentId,
        sessionId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check if student has reached maximum scans per session
    if (existingRecords.length >= config.maxScansPerSession) {
      return {
        isDuplicate: true,
        reason: 'max_scans_reached',
        message: `Student has already reached the maximum number of scans (${config.maxScansPerSession}) for this session`,
        lastScan: existingRecords[0] ? {
          id: existingRecords[0].id,
          scanType: existingRecords[0].scanType as ScanActionType,
          timestamp: existingRecords[0].createdAt,
        } : undefined,
        totalScans: existingRecords.length,
        timeSinceLastScan: existingRecords[0] ? 
          Math.floor((Date.now() - existingRecords[0].createdAt.getTime()) / (1000 * 60)) : 0,
      };
    }

    // Check for exact duplicate scan type
    const sameTypeRecord = existingRecords.find(record => record.scanType === scanType);
    
    if (sameTypeRecord) {
      const timeSinceLastScan = Math.floor(
        (Date.now() - sameTypeRecord.createdAt.getTime()) / (1000 * 60)
      );

      // Check if it's within the minimum time between scans
      if (timeSinceLastScan < config.minTimeBetweenScans) {
        return {
          isDuplicate: true,
          reason: 'too_soon',
          message: `Please wait at least ${config.minTimeBetweenScans} minute(s) between scans. Last ${scanType} scan was ${timeSinceLastScan} minute(s) ago`,
          lastScan: {
            id: sameTypeRecord.id,
            scanType: sameTypeRecord.scanType as ScanActionType,
            timestamp: sameTypeRecord.createdAt,
          },
          totalScans: existingRecords.length,
          timeSinceLastScan,
        };
      }

      // Check if multiple scans of the same type are allowed
      if (scanType === 'time_in' && !config.allowMultipleTimeIn) {
        return {
          isDuplicate: true,
          reason: 'multiple_time_in_not_allowed',
          message: 'Only one time-in scan is allowed per session',
          lastScan: {
            id: sameTypeRecord.id,
            scanType: sameTypeRecord.scanType as ScanActionType,
            timestamp: sameTypeRecord.createdAt,
          },
          totalScans: existingRecords.length,
          timeSinceLastScan,
        };
      }

      if (scanType === 'time_out' && !config.allowMultipleTimeOut) {
        return {
          isDuplicate: true,
          reason: 'multiple_time_out_not_allowed',
          message: 'Only one time-out scan is allowed per session',
          lastScan: {
            id: sameTypeRecord.id,
            scanType: sameTypeRecord.scanType as ScanActionType,
            timestamp: sameTypeRecord.createdAt,
          },
          totalScans: existingRecords.length,
          timeSinceLastScan,
        };
      }
    }

    // Check for scans within the duplicate time window
    const recentScans = existingRecords.filter(record => {
      const timeDiff = Math.floor(
        (Date.now() - record.createdAt.getTime()) / (1000 * 60)
      );
      return timeDiff <= config.duplicateTimeWindow;
    });

    if (recentScans.length > 0) {
      const mostRecent = recentScans[0];
      const timeSinceLastScan = Math.floor(
        (Date.now() - mostRecent.createdAt.getTime()) / (1000 * 60)
      );

      return {
        isDuplicate: true,
        reason: 'within_duplicate_window',
        message: `A scan was performed ${timeSinceLastScan} minute(s) ago. Please wait at least ${config.duplicateTimeWindow} minutes between scans`,
        lastScan: {
          id: mostRecent.id,
          scanType: mostRecent.scanType as ScanActionType,
          timestamp: mostRecent.createdAt,
        },
        totalScans: existingRecords.length,
        timeSinceLastScan,
      };
    }

    // Check for logical scan sequence (time-out before time-in)
    if (scanType === 'time_out') {
      const timeInRecord = existingRecords.find(record => record.scanType === 'time_in');
      if (!timeInRecord) {
        return {
          isDuplicate: true,
          reason: 'time_out_without_time_in',
          message: 'Cannot scan time-out without first scanning time-in',
          lastScan: existingRecords[0] ? {
            id: existingRecords[0].id,
            scanType: existingRecords[0].scanType as ScanActionType,
            timestamp: existingRecords[0].createdAt,
          } : undefined,
          totalScans: existingRecords.length,
          timeSinceLastScan: existingRecords[0] ? 
            Math.floor((Date.now() - existingRecords[0].createdAt.getTime()) / (1000 * 60)) : 0,
        };
      }
    }

    // No duplicate found
    return {
      isDuplicate: false,
      reason: 'no_duplicate',
      message: 'No duplicate scan detected',
      lastScan: existingRecords[0] ? {
        id: existingRecords[0].id,
        scanType: existingRecords[0].scanType as ScanActionType,
        timestamp: existingRecords[0].createdAt,
      } : undefined,
      totalScans: existingRecords.length,
      timeSinceLastScan: existingRecords[0] ? 
        Math.floor((Date.now() - existingRecords[0].createdAt.getTime()) / (1000 * 60)) : 0,
    };

  } catch (error) {
    console.error('Error checking for duplicate scans:', error);
    
    return {
      isDuplicate: false,
      reason: 'error',
      message: 'Error occurred while checking for duplicates. Proceeding with scan.',
      lastScan: undefined,
      totalScans: 0,
      timeSinceLastScan: 0,
    };
  }
}

/**
 * Check for duplicate scans across multiple sessions for the same event
 */
export async function checkDuplicateScanAcrossSessions(
  studentId: string,
  eventId: string,
  scanType: ScanActionType,
  config: DuplicateCheckConfig = DEFAULT_DUPLICATE_CONFIG
): Promise<DuplicateCheckResult> {
  try {
    // Get all attendance records for this student in this event
    const existingRecords = await prisma.attendance.findMany({
      where: {
        studentId,
        eventId,
      },
      include: {
        session: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check for recent scans across all sessions
    const recentScans = existingRecords.filter(record => {
      const timeDiff = Math.floor(
        (Date.now() - record.createdAt.getTime()) / (1000 * 60)
      );
      return timeDiff <= config.duplicateTimeWindow;
    });

    if (recentScans.length > 0) {
      const mostRecent = recentScans[0];
      const timeSinceLastScan = Math.floor(
        (Date.now() - mostRecent.createdAt.getTime()) / (1000 * 60)
      );

      return {
        isDuplicate: true,
        reason: 'cross_session_duplicate',
        message: `A ${mostRecent.scanType} scan was performed ${timeSinceLastScan} minute(s) ago in session "${mostRecent.session.name}". Please wait at least ${config.duplicateTimeWindow} minutes between scans`,
        lastScan: {
          id: mostRecent.id,
          scanType: mostRecent.scanType as ScanActionType,
          timestamp: mostRecent.createdAt,
        },
        totalScans: existingRecords.length,
        timeSinceLastScan,
      };
    }

    // No duplicate found across sessions
    return {
      isDuplicate: false,
      reason: 'no_duplicate',
      message: 'No duplicate scan detected across sessions',
      lastScan: existingRecords[0] ? {
        id: existingRecords[0].id,
        scanType: existingRecords[0].scanType as ScanActionType,
        timestamp: existingRecords[0].createdAt,
      } : undefined,
      totalScans: existingRecords.length,
      timeSinceLastScan: existingRecords[0] ? 
        Math.floor((Date.now() - existingRecords[0].createdAt.getTime()) / (1000 * 60)) : 0,
    };

  } catch (error) {
    console.error('Error checking for duplicate scans across sessions:', error);
    
    return {
      isDuplicate: false,
      reason: 'error',
      message: 'Error occurred while checking for duplicates across sessions. Proceeding with scan.',
      lastScan: undefined,
      totalScans: 0,
      timeSinceLastScan: 0,
    };
  }
}

/**
 * Get scan history for a student in a session
 */
export async function getStudentScanHistory(
  studentId: string,
  sessionId: string
): Promise<AttendanceRecord[]> {
  try {
    const records = await prisma.attendance.findMany({
      where: {
        studentId,
        sessionId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(record => ({
      id: record.id,
      studentId: record.studentId,
      sessionId: record.sessionId,
      eventId: record.eventId,
      organizerId: record.scannedBy || '',
      scanType: record.scanType as ScanActionType,
      timestamp: record.createdAt,
      location: undefined, // Not stored in current schema
      metadata: {
        qrData: '',
        deviceInfo: '',
        userAgent: record.userAgent || '',
      },
    }));

  } catch (error) {
    console.error('Error getting student scan history:', error);
    return [];
  }
}

/**
 * Get scan statistics for a session
 */
export async function getSessionScanStats(sessionId: string): Promise<{
  totalScans: number;
  timeInScans: number;
  timeOutScans: number;
  uniqueStudents: number;
  incompleteScans: number; // Students with only time-in or only time-out
}> {
  try {
    const [totalScans, timeInScans, timeOutScans, uniqueStudents, incompleteScans] = await Promise.all([
      // Total scans
      prisma.attendance.count({
        where: { sessionId },
      }),
      
      // Time-in scans
      prisma.attendance.count({
        where: { 
          sessionId,
          scanType: 'time_in',
        },
      }),
      
      // Time-out scans
      prisma.attendance.count({
        where: { 
          sessionId,
          scanType: 'time_out',
        },
      }),
      
      // Unique students
      prisma.attendance.groupBy({
        by: ['studentId'],
        where: { sessionId },
        _count: { studentId: true },
      }).then(result => result.length),
      
      // Incomplete scans (students with only time-in or only time-out)
      prisma.$queryRaw`
        SELECT COUNT(*) as incomplete_count
        FROM (
          SELECT student_id, 
                 COUNT(CASE WHEN scan_type = 'time_in' THEN 1 END) as time_in_count,
                 COUNT(CASE WHEN scan_type = 'time_out' THEN 1 END) as time_out_count
          FROM "Attendance"
          WHERE session_id = ${sessionId}
          GROUP BY student_id
          HAVING (time_in_count > 0 AND time_out_count = 0) OR (time_in_count = 0 AND time_out_count > 0)
        ) as incomplete_students
      `.then((result: unknown) => (result as Record<string, unknown>[])[0]?.incomplete_count || 0),
    ]);

    return {
      totalScans,
      timeInScans,
      timeOutScans,
      uniqueStudents,
      incompleteScans: Number(incompleteScans),
    };

  } catch (error) {
    console.error('Error getting session scan stats:', error);
    return {
      totalScans: 0,
      timeInScans: 0,
      timeOutScans: 0,
      uniqueStudents: 0,
      incompleteScans: 0,
    };
  }
}

/**
 * Validate scan sequence for a student
 */
export async function validateScanSequence(
  studentId: string,
  sessionId: string,
  scanType: ScanActionType
): Promise<{
  isValid: boolean;
  reason?: string;
  message?: string;
}> {
  try {
    const existingRecords = await prisma.attendance.findMany({
      where: {
        studentId,
        sessionId,
      },
      orderBy: { createdAt: 'asc' },
    });

    const timeInRecord = existingRecords.find(record => record.scanType === 'time_in');
    const timeOutRecord = existingRecords.find(record => record.scanType === 'time_out');

    // Check for logical sequence
    if (scanType === 'time_out' && !timeInRecord) {
      return {
        isValid: false,
        reason: 'no_time_in',
        message: 'Cannot scan time-out without first scanning time-in',
      };
    }

    if (scanType === 'time_in' && timeInRecord) {
      return {
        isValid: false,
        reason: 'already_time_in',
        message: 'Time-in has already been scanned for this session',
      };
    }

    if (scanType === 'time_out' && timeOutRecord) {
      return {
        isValid: false,
        reason: 'already_time_out',
        message: 'Time-out has already been scanned for this session',
      };
    }

    return {
      isValid: true,
      reason: 'valid_sequence',
      message: 'Scan sequence is valid',
    };

  } catch (error) {
    console.error('Error validating scan sequence:', error);
    return {
      isValid: false,
      reason: 'error',
      message: 'Error occurred while validating scan sequence',
    };
  }
}
