'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  CheckCircle, 
  User, 
  Clock, 
  GraduationCap,
  QrCode,
  Scan,
  X,
  AlertCircle,
  RefreshCw,
  Settings,
  Flashlight,
  FlashlightOff,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';
import { parseQRCodeData } from '@/lib/qr/session-generator';
import { 
  createQRScanner, 
  startQRScanning, 
  stopQRScanning, 
  isQRScanningSupported,
  getQRCameras 
} from '@/lib/scanning/qr-detector';
import { 
  requestCameraPermission, 
  getCameraPermissionStatus 
} from '@/lib/scanning/permission-utils';
import { getCameraDevices, createCameraStream, stopCameraStream } from '@/lib/scanning/camera-utils';
import QrScanner from 'qr-scanner';

interface QRCodeScannerProps {
  sessionId: string;
  eventId: string;
  sessionName: string;
  eventName: string;
  onAttendanceRecorded?: (attendanceData: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

interface StudentAttendanceData {
  studentId: string;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  programName?: string;
  year?: number;
  timestamp: string;
}

interface SessionAttendanceData {
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

export function QRCodeScanner({
  sessionId,
  eventId,
  sessionName,
  eventName,
  onAttendanceRecorded,
  onError
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [parsedData, setParsedData] = useState<StudentAttendanceData | SessionAttendanceData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [availableCameras, setAvailableCameras] = useState<Record<string, unknown>[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [flashlightEnabled, setFlashlightEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanHistory, setScanHistory] = useState<Array<{data: StudentAttendanceData | SessionAttendanceData, timestamp: Date}>>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check QR scanning support and permissions on mount
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const isSupported = await isQRScanningSupported();
        if (!isSupported) {
          setError('QR scanning is not supported in this browser');
          return;
        }

        const permissionStatus = await getCameraPermissionStatus();
        setPermissionStatus(permissionStatus.granted ? 'granted' : permissionStatus.denied ? 'denied' : 'prompt');

        if (permissionStatus.granted) {
          const cameras = await getQRCameras();
          setAvailableCameras(cameras);
          if (cameras.length > 0) {
            setSelectedCameraId(cameras[0].id as string);
          }
        }
      } catch (err) {
        console.error('Error initializing scanner:', err);
        setError('Failed to initialize QR scanner');
      }
    };

    initializeScanner();
  }, []);

  // Enhanced QR detection handler
  const handleQRDetection = useCallback((result: { data: string; cornerPoints: unknown[] }) => {
    if (isProcessing) return; // Prevent multiple simultaneous scans
    
    setIsProcessing(true);
    setError(null);
    
    try {
      processQRCode(result.data);
      
      // Play success sound if enabled
      if (soundEnabled) {
        playSuccessSound();
      }
      
      // Add to scan history
      if (parsedData) {
        setScanHistory(prev => [...prev.slice(-9), { data: parsedData, timestamp: new Date() }]);
      }
      
      setScanCount(prev => prev + 1);
    } catch (err) {
      console.error('Error processing QR code:', err);
      setError('Failed to process QR code');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, soundEnabled, parsedData]);

  // Play success sound
  const playSuccessSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch {
      // Ignore audio errors
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      
      // Check permissions first
      if (permissionStatus !== 'granted') {
        const permissionResult = await requestCameraPermission();
        if (!permissionResult.granted) {
          setPermissionStatus('denied');
          setError('Camera access is required for QR scanning');
          return;
        }
        setPermissionStatus('granted');
      }

      if (!videoRef.current) {
        setError('Video element not available');
        return;
      }

      // Create QR scanner
      const scanner = createQRScanner(videoRef.current, {
        onDetect: handleQRDetection,
        onError: (err) => {
          console.error('QR Scanner error:', err);
          setError('Scanner error occurred');
        },
        options: {
          maxScansPerSecond: 3,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: selectedCameraId || 'environment',
        }
      });

      scannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
      
      toast.success('QR Scanner Started', {
        description: 'Point the camera at a QR code to scan',
      });
    } catch (error) {
      console.error('Error starting scanner:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start scanner';
      setError(errorMessage);
      toast.error('Scanner Error', {
        description: errorMessage,
      });
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      stopQRScanning(scannerRef.current);
      scannerRef.current = null;
    }
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
      streamRef.current = null;
    }
    setIsScanning(false);
    setParsedData(null);
    setError(null);
  };

  // Toggle flashlight
  const toggleFlashlight = async () => {
    if (!scannerRef.current) return;
    
    try {
      if (flashlightEnabled) {
        await scannerRef.current.turnFlashlightOff();
        setFlashlightEnabled(false);
      } else {
        await scannerRef.current.turnFlashlightOn();
        setFlashlightEnabled(true);
      }
    } catch (err) {
      console.error('Error toggling flashlight:', err);
      toast.error('Flashlight not available on this device');
    }
  };

  // Switch camera
  const switchCamera = async () => {
    if (!scannerRef.current || availableCameras.length <= 1) return;
    
    try {
      const currentIndex = availableCameras.findIndex(cam => cam.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      const nextCameraId = availableCameras[nextIndex].id as string;
      
      await scannerRef.current.setCamera(nextCameraId);
      setSelectedCameraId(nextCameraId);
      
      toast.success('Camera Switched', {
        description: `Now using ${availableCameras[nextIndex].label || 'camera'}`,
      });
    } catch (err) {
      console.error('Error switching camera:', err);
      toast.error('Failed to switch camera');
    }
  };

  const processQRCode = (qrText: string) => {
    setIsProcessing(true);
    
    try {
      const parseResult = parseQRCodeData(qrText);
      
      if (!parseResult.isValid) {
        throw new Error(parseResult.error || 'Invalid QR code format');
      }

      const { data, type } = parseResult;

      if (type === 'student_attendance') {
        const studentData: StudentAttendanceData = {
          studentId: (data as Record<string, unknown>).studentId as string,
          studentIdNumber: (data as Record<string, unknown>).studentIdNumber as string,
          firstName: (data as Record<string, unknown>).firstName as string,
          lastName: (data as Record<string, unknown>).lastName as string,
          programName: (data as Record<string, unknown>).programName as string,
          year: (data as Record<string, unknown>).year as number,
          timestamp: (data as Record<string, unknown>).timestamp as string,
        };
        setParsedData(studentData);
        setLastScanTime(new Date());
        
        toast.success('Student QR code scanned', {
          description: `${studentData.firstName} ${studentData.lastName} (${studentData.studentIdNumber})`,
        });

        // Record attendance
        recordAttendance(studentData);
      } else if (type === 'session_attendance') {
        const sessionData: SessionAttendanceData = {
          sessionId: (data as Record<string, unknown>).sessionId as string,
          eventId: (data as Record<string, unknown>).eventId as string,
          eventName: (data as Record<string, unknown>).eventName as string,
          sessionName: (data as Record<string, unknown>).sessionName as string,
          startTime: (data as Record<string, unknown>).startTime as string,
          endTime: (data as Record<string, unknown>).endTime as string,
          location: (data as Record<string, unknown>).location as string,
          organizerId: (data as Record<string, unknown>).organizerId as string,
          timestamp: (data as Record<string, unknown>).timestamp as string,
        };
        setParsedData(sessionData);
        setLastScanTime(new Date());
        
        toast.success('Session QR code scanned', {
          description: `${sessionData.eventName} - ${sessionData.sessionName}`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process QR code';
      toast.error('Invalid QR code', {
        description: errorMessage,
      });
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const recordAttendance = async (studentData: StudentAttendanceData) => {
    try {
      const response = await fetch('/api/organizer/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentData.studentId,
          sessionId,
          eventId,
          scanType: 'time_in',
          scannedBy: 'organizer', // This would be the organizer ID in a real implementation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record attendance');
      }

      const result = await response.json();
      
      if (onAttendanceRecorded) {
        onAttendanceRecorded({
          ...studentData,
          attendanceId: result.attendanceId,
          recordedAt: new Date().toISOString(),
        });
      }

      toast.success('Attendance recorded', {
        description: `${studentData.firstName} ${studentData.lastName} has been marked present`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record attendance';
      toast.error('Attendance recording failed', {
        description: errorMessage,
      });
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleManualInput = () => {
    if (manualInput.trim()) {
      processQRCode(manualInput.trim());
      setManualInput('');
      setShowManualInput(false);
    }
  };

  const clearScan = () => {
    setParsedData(null);
    setLastScanTime(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="py-2 sm:py-4">
      <div className="relative">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <Scan className="size-3.5" />
              <span>QR Code Scanner</span>
            </div>
            
            {/* Scanner Stats */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {scanCount} scans
              </Badge>
              {isScanning && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Attendance Scanner</h1>
          
          <p className="mt-1 text-sm text-gray-600 max-w-prose">
            Scan student QR codes to record attendance for {sessionName}.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Status */}
        {permissionStatus === 'denied' && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Camera access is required for QR scanning. Please enable camera permissions in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Scanner Card */}
        <Card className="group relative overflow-hidden rounded-xl border bg-white shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              {eventName}
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              {sessionName}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Camera View */}
            {isScanning && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-blue-500 rounded-lg bg-transparent">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Scanner Controls */}
            <div className="space-y-3">
              {/* Main Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!isScanning ? (
                  <Button
                    onClick={startScanning}
                    disabled={permissionStatus === 'denied'}
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera Scanner
                  </Button>
                ) : (
                  <Button
                    onClick={stopScanning}
                    variant="outline"
                    className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Stop Scanner
                  </Button>
                )}
                
                <Button
                  onClick={() => setShowManualInput(!showManualInput)}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Manual Input
                </Button>
              </div>

              {/* Advanced Controls */}
              {isScanning && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {/* Flashlight Toggle */}
                  <Button
                    onClick={toggleFlashlight}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    {flashlightEnabled ? (
                      <FlashlightOff className="h-4 w-4 mr-1" />
                    ) : (
                      <Flashlight className="h-4 w-4 mr-1" />
                    )}
                    {flashlightEnabled ? 'Flash Off' : 'Flash On'}
                  </Button>

                  {/* Camera Switch */}
                  {availableCameras.length > 1 && (
                    <Button
                      onClick={switchCamera}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Switch Camera
                    </Button>
                  )}

                  {/* Sound Toggle */}
                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    {soundEnabled ? (
                      <VolumeX className="h-4 w-4 mr-1" />
                    ) : (
                      <Volume2 className="h-4 w-4 mr-1" />
                    )}
                    {soundEnabled ? 'Sound Off' : 'Sound On'}
                  </Button>

                  {/* Settings */}
                  <Button
                    onClick={() => {/* TODO: Open settings modal */}}
                    variant="outline"
                    size="sm"
                    className="h-8"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                </div>
              )}
            </div>

            {/* Manual Input */}
            {showManualInput && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Label htmlFor="manual-qr">Enter QR Code Data</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-qr"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste QR code data here..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                  />
                  <Button
                    onClick={handleManualInput}
                    disabled={!manualInput.trim() || isProcessing}
                    className="px-6"
                  >
                    Process
                  </Button>
                </div>
              </div>
            )}

            {/* Last Scan Result */}
            {parsedData && lastScanTime && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Last Scan Result</h3>
                  <Button
                    onClick={clearScan}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-800">
                            {('firstName' in parsedData) ? 
                              `${parsedData.firstName} ${parsedData.lastName}` : 
                              parsedData.sessionName
                            }
                          </span>
                        </div>
                        
                        {('studentIdNumber' in parsedData) && (
                          <div className="space-y-1 text-sm text-green-700">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">ID:</span>
                              <span>{parsedData.studentIdNumber}</span>
                            </div>
                            {parsedData.programName && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-3 w-3" />
                                <span>{parsedData.programName} - Year {parsedData.year}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                          <Clock className="h-3 w-3" />
                          <span>Scanned at {lastScanTime.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Recent Scans
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {scanHistory.slice(-5).reverse().map((scan, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          {'firstName' in scan.data ? 
                            `${scan.data.firstName} ${scan.data.lastName}` : 
                            scan.data.sessionName
                          }
                        </span>
                        {'studentIdNumber' in scan.data && (
                          <span className="text-gray-500 font-mono">
                            ({scan.data.studentIdNumber})
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">
                        {scan.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Scan className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-blue-800 text-sm font-semibold mb-1">How to scan:</p>
                  <ul className="text-blue-700 text-sm leading-relaxed space-y-1">
                    <li>• Point the camera at a student&apos;s QR code</li>
                    <li>• Ensure the QR code is within the scanning frame</li>
                    <li>• Hold steady until the code is detected</li>
                    <li>• Use flashlight in low-light conditions</li>
                    <li>• Switch cameras if needed for better angle</li>
                    <li>• Or use manual input for QR code data</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Bottom Accent Line */}
          <div className="h-0.5 w-0 bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 group-hover:w-full" />
        </Card>
      </div>
    </div>
  );
}

export default QRCodeScanner;
