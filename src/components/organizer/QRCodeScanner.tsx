'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  CheckCircle, 
  User, 
  Clock, 
  GraduationCap,
  QrCode,
  Scan,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { parseQRCodeData } from '@/lib/qr/session-generator';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock QR code detection (in a real implementation, you'd use a library like jsQR)
  // const detectQRCode = (imageData: ImageData): string | null => {
  //   // This is a placeholder - in a real implementation, you'd use jsQR or similar
  //   // For now, we'll simulate QR code detection
  //   return null;
  // };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        toast.success('Camera started', {
          description: 'Point the camera at a QR code to scan',
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Camera access denied', {
        description: 'Please allow camera access to scan QR codes',
      });
      if (onError) {
        onError('Camera access denied');
      }
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setParsedData(null);
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
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-3">
            <Scan className="size-3.5" />
            <span>QR Code Scanner</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Attendance Scanner</h1>
          
          <p className="mt-1 text-sm text-gray-600 max-w-prose">
            Scan student QR codes to record attendance for {sessionName}.
          </p>
        </div>

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
            <div className="flex flex-col sm:flex-row gap-3">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
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
