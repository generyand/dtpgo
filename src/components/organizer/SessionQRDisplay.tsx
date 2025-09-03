'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, Camera, Calendar, MapPin, Clock, Users, AlertCircle, RotateCcw, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface SessionQRDisplayProps {
  sessionId: string;
  eventId: string;
  sessionName: string;
  eventName: string;
  startTime: string;
  endTime: string;
  location?: string;
  onQRGenerated?: (qrUrl: string) => void;
}

interface SessionData {
  id: string;
  name: string;
  description?: string;
  timeInStart: string;
  timeInEnd: string;
  timeOutStart?: string;
  timeOutEnd?: string;
  isActive: boolean;
  event: {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    isActive: boolean;
  };
}

export function SessionQRDisplay({ 
  sessionId, 
  eventId, 
  sessionName, 
  eventName, 
  startTime, 
  endTime, 
  location,
  onQRGenerated 
}: SessionQRDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch session QR code
      const qrResponse = await fetch(`/api/organizer/sessions/${sessionId}/qr`);
      if (!qrResponse.ok) {
        if (qrResponse.status === 404) {
          throw new Error('Session not found. Please verify the session exists.');
        } else if (qrResponse.status === 403) {
          throw new Error('Access denied. You do not have permission to view this session.');
        } else if (qrResponse.status >= 500) {
          throw new Error('Server error. Please try again in a moment.');
        } else {
          throw new Error('Failed to generate session QR code. Please try again.');
        }
      }
      const blob = await qrResponse.blob();
      const qrUrl = URL.createObjectURL(blob);
      setQrCodeUrl(qrUrl);
      
      if (onQRGenerated) {
        onQRGenerated(qrUrl);
      }

      // Fetch additional session data
      const sessionResponse = await fetch(`/api/organizer/sessions/${sessionId}`);
      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        setSessionData(session);
      } else {
        // QR code worked but session data failed - not critical
        console.warn('Could not fetch session details, but QR code is available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error('Failed to generate QR code', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    fetchQRCode();

    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [sessionId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `session-qr-${sessionName.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded', {
        description: 'Session QR code has been saved to your device',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="py-2 sm:py-4">
        <div className="relative">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium mb-3">
              <QrCode className="size-3.5" />
              <span>Session QR Code</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Generating QR Code</h1>
            <p className="mt-1 text-sm text-gray-600 max-w-prose">
              Please wait while we generate the session QR code...
            </p>
          </div>
          
          <Card className="group relative overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="p-6 sm:p-8 space-y-6">
              {/* Session Information Skeleton */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-24"></div>
              </div>

              {/* QR Code Animation */}
              <div className="text-center space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
                  <div className="w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] relative bg-gray-50 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-1 w-full h-full p-4">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-200 rounded-sm animate-pulse"
                          style={{
                            animationDelay: `${i * 20}ms`,
                            animationDuration: '2s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-0.5 w-full bg-gray-200 animate-pulse" />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 sm:py-4">
        <div className="relative">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium mb-3">
              <AlertCircle className="size-3.5" />
              <span>QR Code Error</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Failed to Generate QR Code</h1>
            <p className="mt-1 text-sm text-gray-600 max-w-prose">
              {error}
            </p>
          </div>
          
          <Card className="group relative overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code Generation Failed</h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Button
                onClick={handleRetry}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={retryCount >= 3}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </Button>
              {retryCount >= 3 && (
                <p className="text-xs text-gray-500 mt-3">
                  If the problem persists, please contact support.
                </p>
              )}
            </div>
            <div className="h-0.5 w-0 bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500 group-hover:w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-4">
      <div className="relative">
        {/* Header Section */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-green-50 border border-green-200 text-green-700 text-xs font-medium mb-3">
            <CheckCircle className="size-3.5" />
            <span>Session QR Code Ready</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Session QR Code</h1>
          
          <p className="mt-1 text-sm text-gray-600 max-w-prose">
            Use this QR code for attendance scanning during the session.
          </p>
        </div>

        {/* QR Code Display Card */}
        <Card className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute -right-10 -top-10 size-24 rounded-full bg-blue-400/10 blur-xl group-hover:bg-blue-400/15 transition-colors" />

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              {sessionName}
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              {eventName}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Session Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="size-4 text-blue-600" />
                <span className="font-medium">Start:</span>
                <span>{formatDateTime(startTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="size-4 text-blue-600" />
                <span className="font-medium">End:</span>
                <span>{formatDateTime(endTime)}</span>
              </div>
              {location && (
                <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                  <MapPin className="size-4 text-blue-600" />
                  <span className="font-medium">Location:</span>
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* QR Code Display */}
            {qrCodeUrl && (
              <div className="text-center space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm inline-block border-2 border-gray-100">
                  <Image
                    src={qrCodeUrl}
                    alt={`QR Code for ${sessionName}`}
                    width={320}
                    height={420}
                    className="w-full max-w-[280px] sm:max-w-[320px] h-auto rounded-lg"
                    priority
                  />
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-blue-800 text-sm font-semibold mb-1">Scan this QR code:</p>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        Students can scan this QR code to mark their attendance for this session.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={!qrCodeUrl}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group/btn"
                >
                  <Download className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  Download QR Code
                </Button>

                {/* Trust Indicators */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="size-3 text-green-500" />
                      <span>Ready for Scanning</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="size-3 text-blue-500" />
                      <span>Attendance Tracking</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Bottom Accent Line */}
          <div className="h-0.5 w-0 bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 group-hover:w-full" />
        </Card>
      </div>
    </div>
  );
}

export default SessionQRDisplay;
