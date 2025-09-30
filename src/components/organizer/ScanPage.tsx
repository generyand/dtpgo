'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QRCodeScanner } from './QRCodeScanner';
import { SessionSelector } from './SessionSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  QrCode, 
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

export function ScanPage({ className }: ScanPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
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

  const handleAttendanceRecorded = (attendanceData: Record<string, unknown>) => {
    setAttendanceStats(prev => ({
      totalScanned: prev.totalScanned + 1,
      lastScanTime: new Date(),
    }));
    
    toast.success('Attendance recorded successfully!', {
      description: `Total scanned: ${attendanceStats.totalScanned + 1}`,
    });
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error('Scanner Error', {
      description: errorMessage,
    });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Loading Sessions...</CardTitle>
          <CardDescription>Please wait while we load your available sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={loadSessions} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scanMode === 'scan' && selectedSession) {
    return (
      <div className="space-y-6">
        {/* Session Header */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleBackToSessions}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sessions
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <CardTitle className="text-xl">{selectedSession.event.name}</CardTitle>
                  <CardDescription className="text-base">
                    {selectedSession.name}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={selectedSession.isActive ? 'default' : 'secondary'}
                  className={selectedSession.isActive ? 'bg-green-100 text-green-800' : ''}
                >
                  {selectedSession.isActive ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {selectedSession.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {new Date(selectedSession.timeInStart).toLocaleDateString('en-PH', {
                    timeZone: 'Asia/Manila',
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {new Date(selectedSession.timeInStart).toLocaleTimeString('en-PH', {
                    timeZone: 'Asia/Manila',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })} - {new Date(selectedSession.timeInEnd).toLocaleTimeString('en-PH', {
                    timeZone: 'Asia/Manila',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              {selectedSession.event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{selectedSession.event.location}</span>
                </div>
              )}
            </div>
            
            {/* Attendance Stats */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">Attendance Stats</span>
                </div>
                <div className="text-blue-800">
                  <span className="font-semibold">{attendanceStats.totalScanned}</span>
                  <span className="text-sm ml-1">scanned</span>
                </div>
              </div>
              {attendanceStats.lastScanTime && (
                <div className="text-xs text-blue-600 mt-1">
                  Last scan: {attendanceStats.lastScanTime.toLocaleTimeString('en-PH', {
                    timeZone: 'Asia/Manila',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner */}
        <QRCodeScanner
          sessionId={selectedSession.id}
          eventId={selectedSession.eventId}
          sessionName={selectedSession.name}
          eventName={selectedSession.event.name}
          onAttendanceRecorded={handleAttendanceRecorded}
          onError={handleError}
        />
      </div>
    );
  }

  // Session Selection Mode
  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Select a Session to Scan</CardTitle>
          <CardDescription>
            Choose an active session to start scanning student QR codes for attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionSelector
            sessions={sessions}
            onSessionSelect={handleSessionSelect}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ScanPage;
