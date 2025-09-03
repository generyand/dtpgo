'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ManualEntry } from './ManualEntry';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { ScanningStudent, ScanActionType } from '@/lib/types/scanning';

interface SessionInfo {
  id: string;
  name: string;
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  isActive: boolean;
  timeInWindow?: {
    start: string;
    end: string;
  };
  timeOutWindow?: {
    start: string;
    end: string;
  };
}

export function ManualEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const sessionId = searchParams.get('sessionId');
  const organizerId = user?.id;

  useEffect(() => {
    if (!sessionId || !organizerId) {
      setError('Missing session ID or organizer information');
      setIsLoading(false);
      return;
    }

    loadSessionInfo();
  }, [sessionId, organizerId]);

  const loadSessionInfo = async () => {
    try {
      const response = await fetch(`/api/scanning/process?sessionId=${sessionId}&organizerId=${organizerId}`);
      const data = await response.json();

      if (data.success) {
        setSessionInfo(data.session);
        setRecentScans(data.recentScans || []);
      } else {
        setError(data.message || 'Failed to load session information');
      }
    } catch (error) {
      console.error('Error loading session info:', error);
      setError('Error loading session information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanProcessed = (result: {
    success: boolean;
    student?: ScanningStudent;
    scanType?: ScanActionType;
    message: string;
    error?: string;
  }) => {
    if (result.success) {
      toast.success(`Scan processed successfully! ${result.message}`);
      // Reload recent scans
      loadSessionInfo();
    } else {
      toast.error(result.message || 'Scan processing failed');
    }
  };

  const handleBackToQR = () => {
    router.push(`/organizer/scan?sessionId=${sessionId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/organizer/dashboard');
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading Session Information...</span>
          </CardTitle>
          <CardDescription>
            Please wait while we load the session details and recent scans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={handleBackToDashboard}
              className="flex-1"
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessionInfo) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Session Not Found</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The requested session could not be found or you don't have access to it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Session Information</span>
            <Badge variant={sessionInfo.isActive ? 'default' : 'secondary'}>
              {sessionInfo.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Current session details and scanning windows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Session</h4>
              <p className="text-gray-600">{sessionInfo.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Event</h4>
              <p className="text-gray-600">{sessionInfo.event.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Time-In Window</h4>
              <p className="text-gray-600">
                {sessionInfo.timeInWindow 
                  ? `${new Date(sessionInfo.timeInWindow.start).toLocaleTimeString()} - ${new Date(sessionInfo.timeInWindow.end).toLocaleTimeString()}`
                  : 'Not configured'
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Time-Out Window</h4>
              <p className="text-gray-600">
                {sessionInfo.timeOutWindow 
                  ? `${new Date(sessionInfo.timeOutWindow.start).toLocaleTimeString()} - ${new Date(sessionInfo.timeOutWindow.end).toLocaleTimeString()}`
                  : 'Not configured'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>
              Latest attendance scans for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{scan.studentName}</p>
                    <p className="text-sm text-gray-600">{scan.studentId}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={scan.scanType === 'time_in' ? 'default' : 'secondary'}>
                      {scan.scanType === 'time_in' ? 'Time-In' : 'Time-Out'}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Entry Component */}
      <ManualEntry
        sessionId={sessionId!}
        organizerId={organizerId!}
        onScanProcessed={handleScanProcessed}
        onBackToQR={handleBackToQR}
      />

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handleBackToQR}
          className="flex items-center space-x-2"
        >
          <QrCode className="h-4 w-4" />
          <span>Back to QR Scan</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleBackToDashboard}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Button>
      </div>
    </div>
  );
}
