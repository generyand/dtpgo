'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QRScanner } from './QRScanner';
import { SessionSelector } from './SessionSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface Session {
  id: string;
  name: string;
  description?: string;
  eventId: string;
  event: {
    id: string;
    name: string;
    location?: string;
    startDate: string;
    endDate: string;
  };
  timeInStart: string;
  timeInEnd: string;
  timeOutStart?: string;
  timeOutEnd?: string;
  isActive: boolean;
  _count: {
    attendance: number;
  };
}

interface ScanPageProps {
  className?: string;
}

export function ScanPage({ className: _className }: ScanPageProps) {
  const searchParams = useSearchParams();
  const _router = useRouter();
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'select' | 'scan'>('select');
  const [attendanceStats, setAttendanceStats] = useState({
    totalScanned: 0,
    lastScanTime: null as Date | null,
  });

  // Get sessionId from URL params
  const sessionIdFromUrl = searchParams.get('sessionId');

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-select session if sessionId is in URL
  useEffect(() => {
    if (sessionIdFromUrl && sessions.length > 0) {
      const session = sessions.find(s => s.id === sessionIdFromUrl);
      if (session) {
        setSelectedSession(session);
        setScanMode('scan');
      }
    }
  }, [sessionIdFromUrl, sessions]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/organizer/sessions');
      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      setError(errorMessage);
      toast.error('Error loading sessions', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setScanMode('scan');
    
    // Update URL with sessionId
    const url = new URL(window.location.href);
    url.searchParams.set('sessionId', session.id);
    window.history.replaceState({}, '', url.toString());
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    setScanMode('select');
    
    // Remove sessionId from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('sessionId');
    window.history.replaceState({}, '', url.toString());
  };

  const handleAttendanceRecorded = (_attendanceData: Record<string, unknown>) => {
    setAttendanceStats(prev => ({
      totalScanned: prev.totalScanned + 1,
      lastScanTime: new Date(),
    }));
    
    toast.success('Attendance recorded successfully!', {
      description: `Total scanned: ${attendanceStats.totalScanned + 1}`,
    });
  };

  // Error handling is done inline in the QRScanner component
  // const handleError = (errorMessage: string) => {
  //   setError(errorMessage);
  //   toast.error('Scanner Error', {
  //     description: errorMessage,
  //   });
  // };

  if (loading) {
    return (
      <Card className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-white">Loading Sessions...</CardTitle>
          <CardDescription className="text-blue-200/70">Please wait while we load your available sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-10 bg-white/10 rounded"></div>
            <div className="h-10 bg-white/10 rounded"></div>
            <div className="h-10 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-red-400">Error Loading Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={loadSessions} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scanMode === 'scan' && selectedSession) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Floating Stats Counter */}
        <div className="fixed top-4 right-4 z-50 hidden sm:block">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl shadow-blue-500/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {attendanceStats.totalScanned}
              </div>
              <div className="text-xs text-blue-100 uppercase tracking-wider">
                Scanned Today
              </div>
            </div>
          </div>
        </div>

        {/* Compact Session Header */}
        <Card className="w-full max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Button
                  onClick={handleBackToSessions}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl text-white truncate">{selectedSession.event.name}</CardTitle>
                  <CardDescription className="text-sm text-blue-200/70 truncate">
                    {selectedSession.name}
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant={selectedSession.isActive ? 'default' : 'secondary'}
                className={selectedSession.isActive 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm' 
                  : 'bg-white/10 text-white/60 border-white/20'
                }
              >
                {selectedSession.isActive ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <Clock className="h-3 w-3 mr-1" />
                )}
                {selectedSession.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            {/* Compact Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-blue-200/80">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {new Date(selectedSession.timeInStart).toLocaleDateString('en-PH', {
                    timeZone: 'Asia/Manila',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-blue-200/80">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {new Date(selectedSession.timeInStart).toLocaleTimeString('en-PH', {
                    timeZone: 'Asia/Manila',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              {selectedSession.event.location && (
                <div className="flex items-center gap-2 text-blue-200/80">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{selectedSession.event.location}</span>
                </div>
              )}
            </div>
            
            {/* Mobile Stats */}
            <div className="mt-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl sm:hidden">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-300" />
                  <span className="text-blue-200 font-medium">Scanned</span>
                </div>
                <span className="text-white font-semibold">{attendanceStats.totalScanned}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner - Modern Glassmorphic Design */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <QRScanner
              sessionId={selectedSession.id}
              eventId={selectedSession.eventId}
              onScan={async (qrData, updateScanResult) => {
                console.log('🔍 Processing scanned QR data:', qrData);
                
                try {
                  console.log('📍 Step 1: Parsing QR data...');
                  let studentId: string;
                  let studentData: Record<string, unknown> = {};

                  // Parse the QR data - handle both JSON and plain text
                  try {
                    const parsed = JSON.parse(qrData);
                    // Check if it's actually a JSON object with studentId property
                    if (typeof parsed === 'object' && parsed !== null && parsed.studentId) {
                      studentId = parsed.studentId;
                      studentData = parsed;
                      console.log('✅ Parsed as JSON object:', studentData);
                    } else {
                      // Parsed successfully but it's not a student object (e.g., just a number)
                      console.log('📝 Parsed value is not a student object, treating QR as plain student ID');
                      studentId = qrData.trim();
                    }
                  } catch {
                    // Plain text QR code (just the student ID)
                    console.log('📝 JSON parse failed, treating as plain text student ID');
                    studentId = qrData.trim();
                  }
                  
                  console.log('🔍 Final studentId value:', studentId);
                  console.log('🔍 studentId truthy check:', !!studentId);
                  
                  if (!studentId) {
                    console.error('❌ No student ID found');
                    console.error('❌ studentId value:', studentId);
                    console.error('❌ studentId type:', typeof studentId);
                    toast.error('Invalid QR Code', {
                      description: 'No student ID found in QR code'
                    });
                    throw new Error('No student ID found in QR code');
                  }

                  console.log('📍 Step 2: Student ID validated:', studentId);

                  // Record attendance via API
                  console.log('📍 Step 3: Sending attendance request...');
                  console.log('📤 Request data:', {
                    sessionId: selectedSession.id,
                    eventId: selectedSession.eventId,
                    studentId: studentId,
                    scanType: 'time_in',
                  });

                  const response = await fetch('/api/organizer/attendance', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      sessionId: selectedSession.id,
                      eventId: selectedSession.eventId,
                      studentId: studentId,
                      scanType: 'time_in',
                    }),
                  });

                  console.log('📍 Step 4: Fetch completed');
                  console.log('📥 Response status:', response.status, response.statusText);

                  // Handle duplicate attendance (409 Conflict)
                  if (response.status === 409) {
                    console.log('⚠️ Duplicate scan detected');
                    const errorData = await response.json();
                    
                    // Update scanner display to show the student with duplicate flag
                    updateScanResult({
                      firstName: (studentData.firstName as string) || 'Student',
                      lastName: (studentData.lastName as string) || studentId,
                      studentIdNumber: studentId,
                      isDuplicate: true,
                    });
                    
                    // Show warning toast (not error)
                    toast.warning('Already Recorded', {
                      description: errorData.message || 'This student has already been recorded for this session',
                      duration: 4000,
                    });
                    
                    // Don't throw error - this is expected behavior
                    console.log('✅ Duplicate scan handled gracefully');
                    return;
                  }

                  if (!response.ok) {
                    console.log('📍 Step 5: Response not OK, parsing error...');
                    const errorData = await response.json();
                    console.error('❌ API Error Response:', errorData);
                    throw new Error(errorData.message || errorData.error || 'Failed to record attendance');
                  }

                  console.log('📍 Step 5: Parsing success response...');
                  const result = await response.json();
                  console.log('📍 Step 6: Response parsed successfully');
                  console.log('✅ Attendance recorded successfully:', result);
                  
                  // Update scanner display with real student data
                  if (result.student?.firstName && result.student?.lastName) {
                    updateScanResult({
                      firstName: result.student.firstName,
                      lastName: result.student.lastName,
                      studentIdNumber: result.student.studentIdNumber,
                      isDuplicate: false, // Explicitly mark as not duplicate
                    });
                  }
                  
                  // Update attendance stats with data from API response
                  handleAttendanceRecorded({
                    studentId: studentId,
                    firstName: result.student?.firstName || (studentData.firstName as string) || 'Student',
                    lastName: result.student?.lastName || (studentData.lastName as string) || studentId,
                    studentIdNumber: result.student?.studentIdNumber || (studentData.studentIdNumber as string) || studentId,
                  });

                  // Show success toast with actual student name
                  if (result.student?.firstName && result.student?.lastName) {
                    toast.success('✅ Attendance Recorded!', {
                      description: `${result.student.firstName} ${result.student.lastName} - ${result.student.studentIdNumber}`,
                      duration: 4000,
                    });
                  }

                } catch (error) {
                  console.error('❌ Error recording attendance:', error);
                  console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
                  const errorMsg = error instanceof Error ? error.message : 'Failed to record attendance';
                  toast.error('Recording Failed', {
                    description: errorMsg
                  });
                  throw error; // Re-throw so the scanner can handle it
                }
              }}
              onError={(error) => {
                console.error('Scanner error:', error);
                toast.error('Scanner Error', { description: error });
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session Selection Mode
  return (
    <div className="space-y-6">
      <Card className="w-full max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl text-white">Select a Session</CardTitle>
          <CardDescription className="text-blue-200/70">
            Choose an active session to start scanning QR codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionSelector
            onSessionSelect={handleSessionSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ScanPage;
