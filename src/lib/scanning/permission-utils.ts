/**
 * Camera Permission Utilities
 * Handles camera permission requests, status checking, and user experience optimization
 */

export interface PermissionState {
  status: 'granted' | 'denied' | 'prompt' | 'unknown';
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  error?: string;
}

export interface PermissionRequestOptions {
  showPrompt?: boolean;
  fallbackMessage?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface PermissionError {
  code: string;
  message: string;
  recoverable: boolean;
  fallback?: string;
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public fallback?: string
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * Check if the browser supports the Permissions API
 */
export function isPermissionsAPISupported(): boolean {
  return 'permissions' in navigator;
}

/**
 * Check if the browser supports camera permissions
 */
export function isCameraPermissionSupported(): boolean {
  return isPermissionsAPISupported() && 'camera' in navigator.permissions;
}

/**
 * Get current camera permission status
 */
export async function getCameraPermissionStatus(): Promise<PermissionState> {
  if (!isCameraPermissionSupported()) {
    return {
      status: 'unknown',
      granted: false,
      denied: false,
      prompt: false,
      error: 'Permissions API not supported',
    };
  }

  try {
    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
    
    return {
      status: permission.state as 'granted' | 'denied' | 'prompt' | 'unknown',
      granted: permission.state === 'granted',
      denied: permission.state === 'denied',
      prompt: permission.state === 'prompt',
    };
  } catch (error) {
    return {
      status: 'unknown',
      granted: false,
      denied: false,
      prompt: false,
      error: `Failed to check permission status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Request camera permission with user-friendly error handling
 */
export async function requestCameraPermission(
  options: PermissionRequestOptions = {}
): Promise<PermissionState> {
  const {
    showPrompt = true,
    fallbackMessage = 'Camera access is required for QR code scanning',
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  // Check if camera is supported
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new PermissionError(
      'Camera not supported in this browser',
      'NOT_SUPPORTED',
      false,
      'Please use a modern browser with camera support'
    );
  }

  // Check current permission status
  const currentStatus = await getCameraPermissionStatus();
  
  if (currentStatus.granted) {
    return currentStatus;
  }

  if (currentStatus.denied) {
    throw new PermissionError(
      'Camera access has been permanently denied',
      'PERMANENTLY_DENIED',
      false,
      'Please enable camera access in your browser settings'
    );
  }

  // Request permission by attempting to access camera
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // Stop the stream immediately as we only needed it for permission
      stream.getTracks().forEach(track => track.stop());

      // Check the updated permission status
      const newStatus = await getCameraPermissionStatus();
      return newStatus;
    } catch (error) {
      lastError = error as Error;
      
      // If this is the last attempt, throw the error
      if (attempt === retryAttempts) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Handle the final error
  if (lastError) {
    const permissionError = mapMediaStreamErrorToPermissionError(lastError);
    throw permissionError;
  }

  throw new PermissionError(
    'Failed to request camera permission',
    'REQUEST_FAILED',
    true,
    fallbackMessage
  );
}

/**
 * Map MediaStreamError to PermissionError
 */
function mapMediaStreamErrorToPermissionError(error: Error): PermissionError {
  const errorName = (error as any).name;
  
  switch (errorName) {
    case 'NotAllowedError':
      return new PermissionError(
        'Camera access denied by user',
        'USER_DENIED',
        true,
        'Please allow camera access when prompted'
      );
    
    case 'NotFoundError':
      return new PermissionError(
        'No camera found on this device',
        'NO_CAMERA',
        false,
        'Please connect a camera and try again'
      );
    
    case 'NotReadableError':
      return new PermissionError(
        'Camera is already in use by another application',
        'CAMERA_IN_USE',
        true,
        'Please close other applications using the camera'
      );
    
    case 'OverconstrainedError':
      return new PermissionError(
        'Camera constraints cannot be satisfied',
        'CONSTRAINTS_ERROR',
        true,
        'Please try with different camera settings'
      );
    
    case 'SecurityError':
      return new PermissionError(
        'Camera access blocked due to security restrictions',
        'SECURITY_ERROR',
        false,
        'Please use HTTPS or localhost to access the camera'
      );
    
    case 'TypeError':
      return new PermissionError(
        'Invalid camera constraints provided',
        'INVALID_CONSTRAINTS',
        false,
        'Please check camera configuration'
      );
    
    default:
      return new PermissionError(
        error.message || 'Unknown camera error',
        'UNKNOWN_ERROR',
        true,
        'Please try again or contact support'
      );
  }
}

/**
 * Check if the current environment requires HTTPS for camera access
 */
export function requiresHTTPSForCamera(): boolean {
  return location.protocol !== 'https:' && location.hostname !== 'localhost';
}

/**
 * Get user-friendly error message for camera permission issues
 */
export function getCameraPermissionErrorMessage(error: PermissionError): string {
  if (requiresHTTPSForCamera()) {
    return 'Camera access requires HTTPS. Please use a secure connection.';
  }

  return error.fallback || error.message;
}

/**
 * Get recovery instructions for camera permission errors
 */
export function getCameraPermissionRecoveryInstructions(error: PermissionError): string[] {
  const instructions: string[] = [];

  switch (error.code) {
    case 'USER_DENIED':
      instructions.push('Click the camera icon in your browser\'s address bar');
      instructions.push('Select "Allow" for camera access');
      instructions.push('Refresh the page and try again');
      break;

    case 'PERMANENTLY_DENIED':
      instructions.push('Open your browser settings');
      instructions.push('Navigate to Privacy & Security > Site Settings');
      instructions.push('Find this website and change camera permission to "Allow"');
      instructions.push('Refresh the page and try again');
      break;

    case 'CAMERA_IN_USE':
      instructions.push('Close other applications that might be using the camera');
      instructions.push('Check for video conferencing apps, photo apps, or other browsers');
      instructions.push('Try refreshing the page');
      break;

    case 'NO_CAMERA':
      instructions.push('Connect a camera to your device');
      instructions.push('Ensure the camera is properly installed and recognized');
      instructions.push('Try using a different camera if available');
      break;

    case 'SECURITY_ERROR':
      instructions.push('Use HTTPS instead of HTTP');
      instructions.push('Or access the site from localhost for development');
      break;

    default:
      instructions.push('Try refreshing the page');
      instructions.push('Check your browser\'s camera permissions');
      instructions.push('Contact support if the issue persists');
  }

  return instructions;
}

/**
 * Monitor permission status changes
 */
export function monitorPermissionStatus(
  onStatusChange: (status: PermissionState) => void
): () => void {
  if (!isCameraPermissionSupported()) {
    return () => {};
  }

  let isMonitoring = true;

  const checkStatus = async () => {
    if (!isMonitoring) return;

    try {
      const status = await getCameraPermissionStatus();
      onStatusChange(status);
    } catch (error) {
      console.error('Error monitoring permission status:', error);
    }

    // Check again in 5 seconds
    if (isMonitoring) {
      setTimeout(checkStatus, 5000);
    }
  };

  // Start monitoring
  checkStatus();

  // Return cleanup function
  return () => {
    isMonitoring = false;
  };
}

/**
 * Get browser-specific permission instructions
 */
export function getBrowserSpecificInstructions(): string[] {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome')) {
    return [
      'Click the camera icon in the address bar',
      'Select "Allow" for camera access',
      'If blocked, click "Manage" and change to "Allow"',
    ];
  } else if (userAgent.includes('firefox')) {
    return [
      'Click the camera icon in the address bar',
      'Select "Allow" for camera access',
      'If blocked, click the shield icon and change permissions',
    ];
  } else if (userAgent.includes('safari')) {
    return [
      'Go to Safari > Preferences > Websites',
      'Select "Camera" from the left sidebar',
      'Change this website\'s permission to "Allow"',
    ];
  } else if (userAgent.includes('edge')) {
    return [
      'Click the camera icon in the address bar',
      'Select "Allow" for camera access',
      'If blocked, click "Manage" and change to "Allow"',
    ];
  } else {
    return [
      'Look for a camera icon in your browser\'s address bar',
      'Click it and select "Allow" for camera access',
      'Check your browser\'s privacy settings if needed',
    ];
  }
}

/**
 * Check if the current context is secure for camera access
 */
export function isSecureContext(): boolean {
  return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
}

/**
 * Get environment-specific camera access requirements
 */
export function getCameraAccessRequirements(): {
  isSecure: boolean;
  requiresHTTPS: boolean;
  isLocalhost: boolean;
  recommendations: string[];
} {
  const isSecure = isSecureContext();
  const requiresHTTPS = requiresHTTPSForCamera();
  const isLocalhost = location.hostname === 'localhost';

  const recommendations: string[] = [];

  if (!isSecure) {
    recommendations.push('Use HTTPS for camera access');
  }

  if (requiresHTTPS && !isLocalhost) {
    recommendations.push('Camera access requires a secure connection');
  }

  if (!navigator.mediaDevices) {
    recommendations.push('Your browser does not support camera access');
  }

  return {
    isSecure,
    requiresHTTPS,
    isLocalhost,
    recommendations,
  };
}

/**
 * Create a permission request with retry logic
 */
export async function requestCameraPermissionWithRetry(
  options: PermissionRequestOptions = {}
): Promise<PermissionState> {
  const {
    retryAttempts = 3,
    retryDelay = 2000,
  } = options;

  let lastError: PermissionError | null = null;

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      return await requestCameraPermission(options);
    } catch (error) {
      lastError = error as PermissionError;
      
      // Don't retry for non-recoverable errors
      if (!lastError.recoverable) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === retryAttempts) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError || new PermissionError(
    'Failed to request camera permission after retries',
    'RETRY_FAILED',
    false
  );
}
