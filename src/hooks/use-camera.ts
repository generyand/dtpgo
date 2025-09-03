'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CameraDevice,
  CameraConstraints,
  CameraError,
  isCameraSupported,
  requestCameraPermissions,
  createCameraStream,
  stopCameraStream,
  getOptimalCameraConstraints,
  getRecommendedCameraSettings,
  validateCameraConstraints,
  createFallbackCameraStream,
  monitorCameraStream,
} from '@/lib/scanning/camera-utils';

export interface UseCameraState {
  stream: MediaStream | null;
  devices: CameraDevice[];
  currentDevice: CameraDevice | null;
  isSupported: boolean;
  isLoading: boolean;
  error: CameraError | null;
  isStreamActive: boolean;
  hasPermission: boolean;
}

export interface UseCameraActions {
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
  requestPermissions: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  clearError: () => void;
}

export interface UseCameraOptions {
  autoStart?: boolean;
  preferBackCamera?: boolean;
  onError?: (error: CameraError) => void;
  onStreamStart?: (stream: MediaStream) => void;
  onStreamStop?: () => void;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraState & UseCameraActions {
  const {
    autoStart = false,
    preferBackCamera = true,
    onError,
    onStreamStart,
    onStreamStop,
    onPermissionGranted,
    onPermissionDenied,
  } = options;

  // State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [currentDevice, setCurrentDevice] = useState<CameraDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Refs
  const streamRef = useRef<MediaStream | null>(null);
  const monitorCleanupRef = useRef<(() => void) | null>(null);
  const isSupported = isCameraSupported();

  // Computed state
  const isStreamActive = stream !== null && stream.active;

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle camera errors
  const handleError = useCallback((error: CameraError) => {
    setError(error);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  // Handle stream recovery
  const handleStreamRecover = useCallback(() => {
    setError(null);
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
    
    if (monitorCleanupRef.current) {
      monitorCleanupRef.current();
      monitorCleanupRef.current = null;
    }

    setStream(null);
    setCurrentDevice(null);
    setIsLoading(false);
    onStreamStop?.();
  }, [onStreamStop]);

  // Request camera permissions
  const requestPermissions = useCallback(async () => {
    if (!isSupported) {
      handleError(new CameraError('Camera not supported', 'NOT_SUPPORTED'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const availableDevices = await requestCameraPermissions();
      setDevices(availableDevices);
      setHasPermission(true);
      onPermissionGranted?.();
    } catch (error) {
      const cameraError = error as CameraError;
      handleError(cameraError);
      setHasPermission(false);
      onPermissionDenied?.();
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, handleError, onPermissionGranted, onPermissionDenied]);

  // Refresh available devices
  const refreshDevices = useCallback(async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    try {
      const availableDevices = await requestCameraPermissions();
      setDevices(availableDevices);
    } catch (error) {
      const cameraError = error as CameraError;
      handleError(cameraError);
    }
  }, [hasPermission, requestPermissions, handleError]);

  // Start camera with specific device
  const startCamera = useCallback(async (deviceId?: string) => {
    if (!isSupported) {
      handleError(new CameraError('Camera not supported', 'NOT_SUPPORTED'));
      return;
    }

    // Stop existing stream
    stopCamera();

    setIsLoading(true);
    setError(null);

    try {
      // Get constraints
      const settings = getRecommendedCameraSettings();
      const constraints = getOptimalCameraConstraints(
        deviceId,
        preferBackCamera || settings.preferBackCamera
      );

      // Validate constraints
      if (!validateCameraConstraints(constraints)) {
        throw new CameraError('Invalid camera constraints', 'INVALID_CONSTRAINTS');
      }

      // Create stream
      const newStream = await createCameraStream(constraints);
      
      // Set up stream monitoring
      const cleanup = monitorCameraStream(
        newStream,
        handleError,
        handleStreamRecover
      );

      // Update state
      streamRef.current = newStream;
      monitorCleanupRef.current = cleanup;
      setStream(newStream);
      setIsLoading(false);

      // Find current device
      if (deviceId) {
        const device = devices.find(d => d.deviceId === deviceId);
        setCurrentDevice(device || null);
      } else {
        // Use first available device or null if none
        setCurrentDevice(devices[0] || null);
      }

      onStreamStart?.(newStream);
    } catch (error) {
      const cameraError = error as CameraError;
      handleError(cameraError);
      
      // Try fallback stream
      try {
        const fallbackStream = await createFallbackCameraStream();
        streamRef.current = fallbackStream;
        setStream(fallbackStream);
        setIsLoading(false);
        onStreamStart?.(fallbackStream);
      } catch (fallbackError) {
        const fallbackCameraError = fallbackError as CameraError;
        handleError(fallbackCameraError);
      }
    }
  }, [
    isSupported,
    preferBackCamera,
    devices,
    handleError,
    handleStreamRecover,
    onStreamStart,
    stopCamera,
  ]);

  // Switch to specific camera device
  const switchCamera = useCallback(async (deviceId: string) => {
    const device = devices.find(d => d.deviceId === deviceId);
    if (!device) {
      handleError(new CameraError('Device not found', 'DEVICE_NOT_FOUND'));
      return;
    }

    await startCamera(deviceId);
  }, [devices, startCamera, handleError]);

  // Auto-start camera if enabled
  useEffect(() => {
    if (autoStart && isSupported && hasPermission && devices.length > 0) {
      startCamera();
    }
  }, [autoStart, isSupported, hasPermission, devices.length, startCamera]);

  // Request permissions on mount if supported
  useEffect(() => {
    if (isSupported && !hasPermission) {
      requestPermissions();
    }
  }, [isSupported, hasPermission, requestPermissions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stream) {
        // Page is hidden, stop camera to save resources
        stopCamera();
      } else if (!document.hidden && autoStart && hasPermission && devices.length > 0) {
        // Page is visible, restart camera if auto-start is enabled
        startCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stream, autoStart, hasPermission, devices.length, startCamera, stopCamera]);

  return {
    // State
    stream,
    devices,
    currentDevice,
    isSupported,
    isLoading,
    error,
    isStreamActive,
    hasPermission,

    // Actions
    startCamera,
    stopCamera,
    switchCamera,
    requestPermissions,
    refreshDevices,
    clearError,
  };
}

/**
 * Hook for camera device selection
 */
export function useCameraDeviceSelection(
  devices: CameraDevice[],
  currentDevice: CameraDevice | null
) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    currentDevice?.deviceId || null
  );

  // Update selected device when current device changes
  useEffect(() => {
    if (currentDevice) {
      setSelectedDeviceId(currentDevice.deviceId);
    }
  }, [currentDevice]);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
  }, []);

  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId) || null;

  return {
    selectedDeviceId,
    selectedDevice,
    selectDevice,
  };
}

/**
 * Hook for camera stream health monitoring
 */
export function useCameraHealth(stream: MediaStream | null) {
  const [isHealthy, setIsHealthy] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);

  useEffect(() => {
    if (!stream) {
      setIsHealthy(true);
      setLastHealthCheck(null);
      return;
    }

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      setIsHealthy(false);
      setLastHealthCheck(new Date());
      return;
    }

    const track = videoTracks[0];
    const checkHealth = () => {
      const healthy = track.readyState === 'live';
      setIsHealthy(healthy);
      setLastHealthCheck(new Date());
    };

    // Initial check
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [stream]);

  return {
    isHealthy,
    lastHealthCheck,
  };
}
