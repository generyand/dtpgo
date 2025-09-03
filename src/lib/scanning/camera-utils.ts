/**
 * Camera utilities for QR code scanning
 * Handles WebRTC camera access, device enumeration, and stream management
 */

export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
  groupId: string;
}

export interface CameraConstraints {
  video: {
    width?: { ideal: number; min?: number; max?: number };
    height?: { ideal: number; min?: number; max?: number };
    facingMode?: 'user' | 'environment';
    deviceId?: string;
  };
  audio?: boolean;
}

export interface CameraError {
  code: string;
  message: string;
  name: string;
}

export class CameraError extends Error {
  constructor(
    message: string,
    public code: string,
    public name: string = 'CameraError'
  ) {
    super(message);
    this.name = name;
  }
}

/**
 * Check if the browser supports WebRTC and getUserMedia
 */
export function isCameraSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    window.MediaStream
  );
}

/**
 * Check if the browser supports device enumeration
 */
export function isDeviceEnumerationSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.enumerateDevices
  );
}

/**
 * Get available camera devices
 */
export async function getCameraDevices(): Promise<CameraDevice[]> {
  if (!isDeviceEnumerationSupported()) {
    throw new CameraError(
      'Device enumeration not supported',
      'NOT_SUPPORTED',
      'CameraError'
    );
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        kind: device.kind,
        groupId: device.groupId,
      }));
  } catch (error) {
    throw new CameraError(
      'Failed to enumerate camera devices',
      'ENUMERATION_FAILED',
      'CameraError'
    );
  }
}

/**
 * Request camera permissions and get available devices
 */
export async function requestCameraPermissions(): Promise<CameraDevice[]> {
  if (!isCameraSupported()) {
    throw new CameraError(
      'Camera not supported in this browser',
      'NOT_SUPPORTED',
      'CameraError'
    );
  }

  try {
    // Request permission by getting a temporary stream
    const tempStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    // Stop the temporary stream
    tempStream.getTracks().forEach(track => track.stop());

    // Now get the devices with labels
    return await getCameraDevices();
  } catch (error) {
    if (error instanceof CameraError) {
      throw error;
    }

    const cameraError = error as any;
    throw new CameraError(
      getCameraErrorMessage(cameraError),
      cameraError.name,
      'CameraError'
    );
  }
}

/**
 * Create a camera stream with specified constraints
 */
export async function createCameraStream(
  constraints: CameraConstraints
): Promise<MediaStream> {
  if (!isCameraSupported()) {
    throw new CameraError(
      'Camera not supported in this browser',
      'NOT_SUPPORTED',
      'CameraError'
    );
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    const cameraError = error as any;
    throw new CameraError(
      getCameraErrorMessage(cameraError),
      cameraError.name,
      'CameraError'
    );
  }
}

/**
 * Stop all tracks in a media stream
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
}

/**
 * Get optimal camera constraints for QR scanning
 */
export function getOptimalCameraConstraints(
  deviceId?: string,
  preferBackCamera: boolean = true
): CameraConstraints {
  const constraints: CameraConstraints = {
    video: {
      width: { ideal: 1280, min: 640, max: 1920 },
      height: { ideal: 720, min: 480, max: 1080 },
      facingMode: preferBackCamera ? 'environment' : 'user',
    },
    audio: false,
  };

  if (deviceId) {
    constraints.video.deviceId = deviceId;
    // Remove facingMode when specific device is selected
    delete constraints.video.facingMode;
  }

  return constraints;
}

/**
 * Get camera error message from MediaStreamError
 */
function getCameraErrorMessage(error: any): string {
  switch (error.name) {
    case 'NotAllowedError':
      return 'Camera access denied. Please allow camera permissions and try again.';
    case 'NotFoundError':
      return 'No camera found. Please connect a camera and try again.';
    case 'NotReadableError':
      return 'Camera is already in use by another application.';
    case 'OverconstrainedError':
      return 'Camera constraints cannot be satisfied.';
    case 'SecurityError':
      return 'Camera access blocked due to security restrictions.';
    case 'TypeError':
      return 'Invalid camera constraints provided.';
    default:
      return `Camera error: ${error.message || 'Unknown error occurred'}`;
  }
}

/**
 * Check if the current environment is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if the current environment is iOS
 */
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if the current environment is Android
 */
export function isAndroidDevice(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get recommended camera settings based on device type
 */
export function getRecommendedCameraSettings() {
  const isMobile = isMobileDevice();
  const isIOS = isIOSDevice();
  const isAndroid = isAndroidDevice();

  return {
    isMobile,
    isIOS,
    isAndroid,
    preferBackCamera: isMobile, // Prefer back camera on mobile for QR scanning
    optimalConstraints: getOptimalCameraConstraints(
      undefined,
      isMobile
    ),
  };
}

/**
 * Validate camera constraints before applying
 */
export function validateCameraConstraints(
  constraints: CameraConstraints
): boolean {
  if (!constraints.video) {
    return false;
  }

  // Check if deviceId is provided and is a string
  if (constraints.video.deviceId && typeof constraints.video.deviceId !== 'string') {
    return false;
  }

  // Check if facingMode is valid
  if (constraints.video.facingMode && !['user', 'environment'].includes(constraints.video.facingMode)) {
    return false;
  }

  // Check width constraints
  if (constraints.video.width) {
    const { ideal, min, max } = constraints.video.width;
    if (ideal && (ideal < 1 || ideal > 4096)) return false;
    if (min && (min < 1 || min > 4096)) return false;
    if (max && (max < 1 || max > 4096)) return false;
    if (min && max && min > max) return false;
  }

  // Check height constraints
  if (constraints.video.height) {
    const { ideal, min, max } = constraints.video.height;
    if (ideal && (ideal < 1 || ideal > 4096)) return false;
    if (min && (min < 1 || min > 4096)) return false;
    if (max && (max < 1 || max > 4096)) return false;
    if (min && max && min > max) return false;
  }

  return true;
}

/**
 * Create a fallback camera stream with minimal constraints
 */
export async function createFallbackCameraStream(): Promise<MediaStream> {
  const fallbackConstraints: CameraConstraints = {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
    },
    audio: false,
  };

  return createCameraStream(fallbackConstraints);
}

/**
 * Monitor camera stream health and detect issues
 */
export function monitorCameraStream(
  stream: MediaStream,
  onError: (error: CameraError) => void,
  onRecover: () => void
): () => void {
  let isMonitoring = true;
  let lastFrameTime = Date.now();
  let errorReported = false;

  const checkStreamHealth = () => {
    if (!isMonitoring) return;

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      if (!errorReported) {
        onError(new CameraError('No video tracks found', 'NO_TRACKS', 'CameraError'));
        errorReported = true;
      }
      return;
    }

    const track = videoTracks[0];
    if (track.readyState === 'ended') {
      if (!errorReported) {
        onError(new CameraError('Camera track ended unexpectedly', 'TRACK_ENDED', 'CameraError'));
        errorReported = true;
      }
      return;
    }

    // Reset error state if stream is healthy
    if (errorReported) {
      errorReported = false;
      onRecover();
    }

    // Schedule next check
    setTimeout(checkStreamHealth, 1000);
  };

  // Start monitoring
  checkStreamHealth();

  // Return cleanup function
  return () => {
    isMonitoring = false;
  };
}
