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
  try {
    console.log('Checking QR scanning support...');
    console.log('User Agent:', navigator.userAgent);
    console.log('Is Brave:', navigator.userAgent.includes('Brave'));
    
    // Check basic browser support first
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('MediaDevices API not supported');
      return false;
    }

    // Check if we're in a secure context (required for camera access)
    if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.warn('Camera access requires secure context (HTTPS or localhost)');
      return false;
    }

    // Check if QR scanner library is available
    if (!QrScanner) {
      console.warn('QR Scanner library not available');
      return false;
    }

    // Special handling for Brave browser
    const isBrave = navigator.userAgent.includes('Brave');
    if (isBrave) {
      console.log('Detected Brave browser - checking for specific compatibility issues');
      
      // Brave sometimes has issues with camera permissions
      // Let's try a more direct approach
      try {
        // Test if we can enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Video devices found in Brave:', videoDevices.length);
        
        if (videoDevices.length === 0) {
          console.warn('No video devices found in Brave browser');
          return false;
        }
      } catch (deviceError) {
        console.warn('Could not enumerate devices in Brave:', deviceError);
        // Continue anyway, as this might work with permission
      }
    }

    // Check if camera is available using QrScanner
    console.log('Checking camera availability with QrScanner...');
    const hasCamera = await QrScanner.hasCamera();
    console.log('Camera availability check result:', hasCamera);
    
    // If QrScanner says no camera but we're in Brave, try a more direct test
    if (!hasCamera && isBrave) {
      console.log('QrScanner reported no camera in Brave, trying direct test...');
      try {
        // Try to get a media stream directly
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        console.log('Direct camera test in Brave succeeded');
        // Stop the stream immediately
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (directError) {
        console.warn('Direct camera test in Brave failed:', directError);
        return false;
      }
    }
    
    return hasCamera;
  } catch (error) {
    console.error('Error checking QR scanning support:', error);
    return false;
  }
}

/**
 * Get list of available cameras for QR scanning
 */
export async function getQRCameras(): Promise<Record<string, unknown>[]> {
  try {
    console.log('Getting camera list...');
    const cameras = await QrScanner.listCameras(true) as unknown as Record<string, unknown>[];
    console.log('QR Scanner cameras found:', cameras);
    
    // If QrScanner returns empty array, try alternative detection
    if (cameras.length === 0) {
      console.log('QrScanner returned no cameras, trying alternative detection...');
      return await getCamerasFallback();
    }
    
    return cameras;
  } catch (error) {
    console.error('QR Scanner camera list failed:', error);
    
    // Always try fallback when QrScanner fails
    console.log('QrScanner failed, trying fallback camera detection...');
    return await getCamerasFallback();
  }
}

async function getCamerasFallback(): Promise<Record<string, unknown>[]> {
  try {
    // Try to enumerate devices directly
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log('Direct device enumeration found:', videoDevices);
    
    if (videoDevices.length === 0) {
      console.log('No video devices found via enumeration');
      
      // For Brave browser, try a more direct approach
      if (navigator.userAgent.includes('Brave')) {
        console.log('Brave browser detected, trying direct media stream test...');
        try {
          // Try to get a media stream to trigger permission and detect camera
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          });
          
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack) {
            const settings = videoTrack.getSettings();
            console.log('Camera detected via direct stream:', settings);
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            
            // Return a camera object based on the stream
            return [{
              id: settings.deviceId || 'default-camera',
              label: 'Default Camera',
              kind: 'videoinput',
            }];
          }
        } catch (streamError) {
          console.warn('Direct media stream test failed:', streamError);
        }
      }
    }
    
    return videoDevices.map(device => ({
      id: device.deviceId,
      label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
      kind: device.kind,
    }));
  } catch (enumError) {
    console.warn('Fallback camera detection failed:', enumError);
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

  console.log('Creating QR scanner with video element:', videoElement);
  console.log('Scanner options:', options);

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

  console.log('QR scanner created:', scanner);
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
 * Stop camera stream
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('Stopped camera track:', track.kind);
    });
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
export function getCurrentQRCamera(_scanner: QrScanner): unknown | null {
  // Note: qr-scanner doesn't have getActiveCamera method
  // We'll need to track this separately if needed
  // For now, we can't access the current camera from the scanner instance
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
export function createMobileScanRegion(_video: HTMLVideoElement): Record<string, unknown> {
  // Create a centered region that's 80% of the video size
  const regionSize = 0.8;
  const x = (1 - regionSize) / 2;
  const y = (1 - regionSize) / 2;
  
  // Note: video element is available for future enhancements
  // such as aspect ratio calculations or dynamic sizing
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
export function createDesktopScanRegion(_video: HTMLVideoElement): Record<string, unknown> {
  // For desktop, use a smaller centered region
  const regionSize = 0.6;
  const x = (1 - regionSize) / 2;
  const y = (1 - regionSize) / 2;
  
  // Note: video element is available for future enhancements
  // such as aspect ratio calculations or dynamic sizing
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
