/**
 * TypeScript types for QR code scanning functionality
 */

export interface QRScanResult {
  data: string;
  cornerPoints: any[];
  timestamp: number;
}

export interface ParsedQRData {
  isValid: boolean;
  type: QRDataType;
  payload: any;
  error?: string;
}

export type QRDataType = 
  | 'dtp_session'
  | 'dtp_student'
  | 'url'
  | 'json'
  | 'text'
  | 'unknown';

export interface DTPSessionQR {
  system: 'DTP';
  type: 'session';
  sessionId: string;
  eventId: string;
  data?: string;
}

export interface DTPStudentQR {
  system: 'DTP';
  type: 'student';
  studentId: string;
  data?: string;
}

export interface ScanningStudent {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  program: string;
  year: number;
  isActive: boolean;
}

export interface ScanContext {
  sessionId: string;
  eventId: string;
  organizerId: string;
  timestamp: Date;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
}

export interface ScanType {
  type: ScanActionType;
  reason: string;
  isAllowed: boolean;
  timeWindow?: TimeWindow;
  currentTime: Date;
}

export type ScanActionType = 
  | 'time_in'
  | 'time_out'
  | 'invalid_time'
  | 'session_not_active'
  | 'session_not_found'
  | 'student_not_found'
  | 'invalid_qr_code'
  | 'duplicate_scan'
  | 'session_ended'
  | 'session_not_started';

export interface TimeWindow {
  start: Date;
  end: Date;
  type: 'time_in' | 'time_out';
  isActive: boolean;
  timeRemaining?: number;
}

export interface SessionTimeWindows {
  timeIn: TimeWindow | null;
  timeOut: TimeWindow | null;
  session: {
    id: string;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
  };
}

export interface ScanProcessingResult {
  success: boolean;
  scanType: ScanType;
  student?: ScanningStudent;
  attendanceRecord?: AttendanceRecord;
  duplicateCheck?: DuplicateCheckResult;
  error?: string;
  message: string;
  timestamp: Date;
  metadata: ScanResultMetadata;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  eventId: string;
  organizerId: string;
  scanType: ScanActionType;
  timestamp: Date;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
  metadata?: {
    qrData: string;
    cornerPoints?: any[];
    deviceInfo?: string;
    userAgent?: string;
  };
}

export interface StudentValidationResult {
  isValid: boolean;
  student?: ScanningStudent;
  error?: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: {
    id: string;
    eventId: string;
    name: string;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
    timeInWindow?: {
      start: Date;
      end: Date;
    };
    timeOutWindow?: {
      start: Date;
      end: Date;
    };
  };
  error?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
  message?: string;
  lastScan?: {
    id: string;
    scanType: ScanActionType;
    timestamp: Date;
  };
  totalScans?: number;
  timeSinceLastScan?: number;
}

export interface ScanRequest {
  qrData: string;
  sessionId: string;
  organizerId: string;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
  metadata?: {
    deviceInfo?: string;
    userAgent?: string;
    timestamp?: Date;
  };
}

export interface ScanResponse {
  success: boolean;
  result: ScanProcessingResult;
  student?: StudentValidationResult['student'];
  session?: SessionValidationResult['session'];
  duplicateCheck?: DuplicateCheckResult;
}

export interface ScanHistory {
  id: string;
  studentId: string;
  sessionId: string;
  scanType: ScanActionType;
  timestamp: Date;
  success: boolean;
  message: string;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
}

export interface ScanStatistics {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  timeInScans: number;
  timeOutScans: number;
  duplicateScans: number;
  averageScanTime: number;
  lastScanTime?: Date;
}

export interface ScanError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
}

export interface ScanConfiguration {
  allowDuplicateScans: boolean;
  duplicateScanCooldown: number; // in minutes
  maxScansPerMinute: number;
  requireLocation: boolean;
  locationAccuracyThreshold: number; // in meters
  enableScanHistory: boolean;
  enableStatistics: boolean;
}

export interface ScanValidationRules {
  sessionActive: boolean;
  timeWindowValid: boolean;
  studentEnrolled: boolean;
  organizerAuthorized: boolean;
  locationValid?: boolean;
  duplicateAllowed: boolean;
}

export interface ScanProcessingOptions {
  validateLocation: boolean;
  checkDuplicates: boolean;
  createHistory: boolean;
  updateStatistics: boolean;
  strictMode: boolean;
}

export interface ScanContextData {
  currentSession: SessionValidationResult['session'];
  currentOrganizer: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  currentTime: Date;
  timeZone: string;
  location?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
}

export interface ScanResultMetadata {
  timestamp: string;
  processingTime: number;
  validationTime: number;
  databaseTime: number;
  totalTime: number;
  cacheHits: number;
  cacheMisses: number;
  errors: ScanError[];
  warnings: string[];
}

export interface ScanProcessingContext {
  request: ScanRequest;
  context: ScanContextData;
  options: ScanProcessingOptions;
  metadata: ScanResultMetadata;
}

export interface ScanProcessingPipeline {
  validateQR: (qrData: string) => ParsedQRData;
  validateStudent: (studentId: string) => Promise<StudentValidationResult>;
  validateSession: (sessionId: string) => Promise<SessionValidationResult>;
  determineScanType: (context: ScanContextData) => ScanType;
  checkDuplicates: (studentId: string, sessionId: string, scanType: ScanActionType) => Promise<DuplicateCheckResult>;
  createAttendanceRecord: (data: Partial<AttendanceRecord>) => Promise<AttendanceRecord>;
  updateStatistics: (result: ScanProcessingResult) => Promise<void>;
  logScanHistory: (history: Partial<ScanHistory>) => Promise<void>;
}

// Re-export for backward compatibility
export type { ScanProcessingResult as ScanResult };
