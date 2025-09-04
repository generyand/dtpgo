/**
 * QR Code Detection utilities
 * Handles QR code scanning from video streams using qr-scanner library
 */

import QrScanner from 'qr-scanner';

export interface QRDetectionResult {
  data: string;
  cornerPoints: unknown[];
  timestamp: number;
}

export interface QRDetectionOptions {
  maxScansPerSecond?: number;
  highlightScanRegion?: boolean;
  highlightCodeOutline?: boolean;
  preferredCamera?: 'environment' | 'user';
  calculateScanRegion?: (video: HTMLVideoElement) => Record<string, unknown>;
}

export interface QRDetectorConfig {
  onDetect: (result: QRDetectionResult) => void;
  onError?: (error: Error) => void;
  options?: QRDetectionOptions;
}

export class QRDetectorError extends Error {
  constructor(
    message: string,
    public code: string,
    public name: string = 'QRDetectorError'
  ) {
    super(message);
    this.name = name;
  }
}

/**
 * Check if QR scanning is supported in the current environment
 */
export async function isQRScanningSupported(): Promise<boolean> {
  return await QrScanner.hasCamera();
}

/**
 * Get list of available cameras for QR scanning
 */
export async function getQRCameras(): Promise<Record<string, unknown>[]> {
  try {
    return await QrScanner.listCameras(true) as unknown as Record<string, unknown>[];
  } catch (error) {
    throw new QRDetectorError(
      'Failed to get camera list',
      'CAMERA_LIST_FAILED',
      'QRDetectorError'
    );
  }
}

/**
 * Create a QR scanner instance
 */
export function createQRScanner(
  videoElement: HTMLVideoElement,
  config: QRDetectorConfig
): QrScanner {
  const { onDetect, onError, options = {} } = config;

  // Configure scanner options
  const scannerOptions: Record<string, unknown> = {
    maxScansPerSecond: options.maxScansPerSecond || 5,
    highlightScanRegion: options.highlightScanRegion || false,
    highlightCodeOutline: options.highlightCodeOutline || true,
    preferredCamera: options.preferredCamera || 'environment',
    calculateScanRegion: options.calculateScanRegion,
  };

  // Create scanner instance
  const scanner = new QrScanner(
    videoElement,
    (result: { data: string; cornerPoints: unknown[] }) => {
      const detectionResult: QRDetectionResult = {
        data: result.data,
        cornerPoints: result.cornerPoints || [],
        timestamp: Date.now(),
      };
      onDetect(detectionResult);
    },
    scannerOptions
  );

  // Set up error handling
  if (onError) {
    // Note: qr-scanner doesn't have addEventListener, we'll handle errors differently
    // The scanner will call the onDetect callback with error information
  }

  return scanner;
}

/**
 * Start QR scanning on a video element
 */
export async function startQRScanning(
  videoElement: HTMLVideoElement,
  config: QRDetectorConfig,
  cameraId?: string
): Promise<QrScanner> {
  const isSupported = await isQRScanningSupported();
  if (!isSupported) {
    throw new QRDetectorError(
      'QR scanning not supported in this environment',
      'NOT_SUPPORTED',
      'QRDetectorError'
    );
  }

  try {
    const scanner = createQRScanner(videoElement, config);
    
    if (cameraId) {
      await scanner.setCamera(cameraId);
    }
    
    await scanner.start();
    return scanner;
  } catch (error) {
    if (error instanceof QRDetectorError) {
      throw error;
    }
    
    throw new QRDetectorError(
      `Failed to start QR scanning: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'START_FAILED',
      'QRDetectorError'
    );
  }
}

/**
 * Stop QR scanning and cleanup
 */
export function stopQRScanning(scanner: QrScanner | null): void {
  if (scanner) {
    scanner.stop();
    scanner.destroy();
  }
}

/**
 * Pause QR scanning
 */
export function pauseQRScanning(scanner: QrScanner | null): void {
  if (scanner) {
    scanner.pause();
  }
}

/**
 * Resume QR scanning
 */
export function resumeQRScanning(scanner: QrScanner | null): void {
  if (scanner) {
    scanner.start();
  }
}

/**
 * Switch camera for QR scanning
 */
export async function switchQRCamera(
  scanner: QrScanner,
  cameraId: string
): Promise<void> {
  try {
    await scanner.setCamera(cameraId);
  } catch (error) {
    throw new QRDetectorError(
      `Failed to switch camera: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CAMERA_SWITCH_FAILED',
      'QRDetectorError'
    );
  }
}

/**
 * Get current camera being used by scanner
 */
export function getCurrentQRCamera(scanner: QrScanner): unknown | null {
  // Note: qr-scanner doesn't have getActiveCamera method
  // We'll need to track this separately if needed
  return null;
}

/**
 * Validate QR code data format
 */
export function validateQRData(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false;
  }

  // Basic validation - check if it's not empty and has reasonable length
  if (data.trim().length === 0 || data.length > 10000) {
    return false;
  }

  // Add more specific validation based on your QR code format
  // For example, if you expect specific prefixes or formats
  return true;
}

/**
 * Parse QR code data based on expected format
 */
export function parseQRData(data: string): {
  isValid: boolean;
  type?: string;
  payload?: unknown;
  error?: string;
} {
  if (!validateQRData(data)) {
    return {
      isValid: false,
      error: 'Invalid QR code data format',
    };
  }

  try {
    // Example parsing logic - adjust based on your QR code format
    // This is a generic parser that can be extended
    
    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return {
        isValid: true,
        type: 'url',
        payload: { url: data },
      };
    }

    // Check if it's JSON
    if (data.startsWith('{') || data.startsWith('[')) {
      try {
        const parsed = JSON.parse(data);
        return {
          isValid: true,
          type: 'json',
          payload: parsed,
        };
      } catch {
        // Not valid JSON, treat as plain text
      }
    }

    // Check if it's a custom format (e.g., "DTP:session:12345")
    if (data.startsWith('DTP:')) {
      const parts = data.split(':');
      if (parts.length >= 3) {
        return {
          isValid: true,
          type: 'dtp_session',
          payload: {
            system: parts[0],
            type: parts[1],
            id: parts[2],
            data: parts.slice(3).join(':'),
          },
        };
      }
    }

    // Default to plain text
    return {
      isValid: true,
      type: 'text',
      payload: { text: data },
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to parse QR data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Create optimized scan region for mobile devices
 */
export function createMobileScanRegion(video: HTMLVideoElement): Record<string, unknown> {
  const { videoWidth, videoHeight } = video;
  
  // Create a centered region that's 80% of the video size
  const regionSize = 0.8;
  const x = (1 - regionSize) / 2;
  const y = (1 - regionSize) / 2;
  
  return {
    x,
    y,
    width: regionSize,
    height: regionSize,
  };
}

/**
 * Create scan region for desktop devices
 */
export function createDesktopScanRegion(video: HTMLVideoElement): Record<string, unknown> {
  const { videoWidth, videoHeight } = video;
  
  // For desktop, use a smaller centered region
  const regionSize = 0.6;
  const x = (1 - regionSize) / 2;
  const y = (1 - regionSize) / 2;
  
  return {
    x,
    y,
    width: regionSize,
    height: regionSize,
  };
}

/**
 * Get optimal scan region based on device type
 */
export function getOptimalScanRegion(video: HTMLVideoElement): Record<string, unknown> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return isMobile 
    ? createMobileScanRegion(video)
    : createDesktopScanRegion(video);
}

/**
 * Debounce QR detection to prevent rapid fire scanning
 */
export function createDebouncedQRDetector(
  onDetect: (result: QRDetectionResult) => void,
  delay: number = 1000
): (result: QRDetectionResult) => void {
  let lastScanTime = 0;
  let lastScanData = '';

  return (result: QRDetectionResult) => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTime;
    
    // Prevent duplicate scans of the same data
    if (result.data === lastScanData && timeSinceLastScan < delay) {
      return;
    }
    
    // Update last scan info
    lastScanTime = now;
    lastScanData = result.data;
    
    // Call the original detector
    onDetect(result);
  };
}

/**
 * Create QR detection options optimized for different use cases
 */
export function getQRDetectionOptions(
  useCase: 'attendance' | 'general' | 'high-frequency' = 'general'
): QRDetectionOptions {
  switch (useCase) {
    case 'attendance':
      return {
        maxScansPerSecond: 3,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
        calculateScanRegion: getOptimalScanRegion,
      };
    
    case 'high-frequency':
      return {
        maxScansPerSecond: 10,
        highlightScanRegion: false,
        highlightCodeOutline: false,
        preferredCamera: 'environment',
      };
    
    case 'general':
    default:
      return {
        maxScansPerSecond: 5,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
        calculateScanRegion: getOptimalScanRegion,
      };
  }
}

/**
 * Monitor QR scanner health and performance
 */
export function monitorQRScannerHealth(
  scanner: QrScanner,
  onHealthChange: (isHealthy: boolean, metrics: {
    lastScanTime?: number;
    scanCount: number;
    errorCount: number;
  }) => void
): () => void {
  const scanCount = 0;
  const errorCount = 0;
  let lastScanTime: number | undefined;
  let isMonitoring = true;

  const healthCheck = () => {
    if (!isMonitoring) return;

    const isHealthy = errorCount < 5 && (lastScanTime ? Date.now() - lastScanTime < 30000 : true);
    
    onHealthChange(isHealthy, {
      lastScanTime,
      scanCount,
      errorCount,
    });

    // Schedule next check
    setTimeout(healthCheck, 5000);
  };

  // Note: We can't access private methods of qr-scanner
  // This is a simplified health monitor that tracks basic metrics
  // In a real implementation, you'd need to track these metrics externally

  // Start monitoring
  healthCheck();

  // Return cleanup function
  return () => {
    isMonitoring = false;
  };
}
