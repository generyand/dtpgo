/**
 * Client-safe QR code utilities that don't use Node.js-specific modules
 */

export interface SessionQRData {
  sessionId: string;
  eventId: string;
  eventName: string;
  sessionName: string;
  startTime: string;
  endTime: string;
  location?: string;
  organizerId?: string;
  timestamp: string;
}

export interface StudentQRData {
  studentId: string;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  programName?: string;
  year?: number;
  timestamp: string;
}

// Union type for QR code validation
type QRCodeData = 
  | { type: 'session_attendance'; sessionId: string; eventId: string; timestamp: string }
  | { type: 'student_attendance'; studentId: string; studentIdNumber: string; timestamp: string }
  | { type: 'session_info'; sessionId: string; eventId: string; sessionName: string; eventName: string };

/**
 * Validate QR code data structure (client-safe)
 */
export function validateQRCodeData(data: unknown): {
  isValid: boolean;
  type?: 'session_attendance' | 'student_attendance';
  error?: string;
} {
  try {
    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Invalid QR code data format' };
    }

    const qrData = data as QRCodeData;
    
    if (!qrData.type) {
      return { isValid: false, error: 'Missing QR code type' };
    }

    if (qrData.type === 'session_attendance') {
      const requiredFields = ['sessionId', 'eventId', 'timestamp'] as const;
      for (const field of requiredFields) {
        if (!qrData[field]) {
          return { isValid: false, error: `Missing required field: ${field}` };
        }
      }
      return { isValid: true, type: 'session_attendance' };
    }

    if (qrData.type === 'student_attendance') {
      const requiredFields = ['studentId', 'studentIdNumber', 'timestamp'] as const;
      for (const field of requiredFields) {
        if (!qrData[field]) {
          return { isValid: false, error: `Missing required field: ${field}` };
        }
      }
      return { isValid: true, type: 'student_attendance' };
    }

    return { isValid: false, error: 'Unknown QR code type' };
  } catch {
    return { isValid: false, error: 'Failed to validate QR code data' };
  }
}

/**
 * Parse QR code text and validate structure (client-safe)
 */
export function parseQRCodeData(qrText: string): {
  isValid: boolean;
  data?: unknown;
  type?: 'session_attendance' | 'student_attendance';
  error?: string;
} {
  try {
    const data = JSON.parse(qrText);
    const validation = validateQRCodeData(data);
    
    if (!validation.isValid) {
      return { isValid: false, error: validation.error };
    }

    return {
      isValid: true,
      data,
      type: validation.type,
    };
  } catch {
    return { isValid: false, error: 'Invalid JSON in QR code' };
  }
}
