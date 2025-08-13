'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Download, CheckCircle, Camera, User, AlertCircle, RotateCcw, Zap } from 'lucide-react';

interface QRCodeDisplayProps {
  studentId: string;
}

interface StudentData {
  firstName: string;
  lastName: string;
  studentIdNumber: string;
}

export function QRCodeDisplay({ studentId }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch QR code
      const qrResponse = await fetch(`/api/students/${studentId}/qr`);
      if (!qrResponse.ok) {
        if (qrResponse.status === 404) {
          throw new Error('Student record not found. Please verify your registration.');
        } else if (qrResponse.status >= 500) {
          throw new Error('Server error. Please try again in a moment.');
        } else {
          throw new Error('Failed to generate QR code. Please try again.');
        }
      }
      const blob = await qrResponse.blob();
      setQrCodeUrl(URL.createObjectURL(blob));

      // Fetch student data
      const studentResponse = await fetch(`/api/students/${studentId}`);
      if (studentResponse.ok) {
        const student = await studentResponse.json();
        setStudentData({
          firstName: student.firstName,
          lastName: student.lastName,
          studentIdNumber: student.studentIdNumber
        });
      } else {
        // QR code worked but student data failed - not critical
        console.warn('Could not fetch student details, but QR code is available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    fetchData();

    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
    // The qrCodeUrl is intentionally omitted from the dependency array to prevent an infinite loop.
    // The cleanup function correctly uses the value from the previous render to revoke the old URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `dtp-qr-code-${studentData?.studentIdNumber || studentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-amber-50 min-h-screen py-8 px-4">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-2xl flex items-center justify-center min-h-[60vh]">
          <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-lg">
            <div className="absolute -right-10 -top-10 size-24 rounded-full bg-yellow-400/10 blur-xl" />
            <div className="relative p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-amber-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm font-medium">
                {retryCount > 0 ? 'Retrying...' : 'Generating your QR code...'}
              </p>
            </div>
            <div className="h-1 w-0 bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 group-hover:w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-amber-50 min-h-screen py-8 px-4">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-2xl flex items-center justify-center min-h-[60vh]">
          <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-lg">
            <div className="absolute -right-10 -top-10 size-24 rounded-full bg-red-400/10 blur-xl" />

            {/* Error Header */}
            <div className="relative bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">QR Code Error</h2>
              <p className="text-red-700 text-sm">Unable to generate your QR code</p>
            </div>

            {/* Error Message & Actions */}
            <div className="relative p-6 sm:p-8 text-center">
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                {error}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={retryCount >= 3}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </Button>

                {retryCount >= 3 && (
                  <p className="text-xs text-gray-500 leading-relaxed">
                    If the problem persists, please contact support or try registering again.
                  </p>
                )}
              </div>
            </div>

            <div className="h-1 w-0 bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500 group-hover:w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative  py-8 px-4">
      <div className="">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 text-green-800 text-sm font-medium mb-4">
              <CheckCircle className="size-4" />
              <span>Registration Complete</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              <span className="text-gray-900">Welcome to </span>
              <span className="text-yellow-500">DTP Events!</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
              Your QR code is ready for future use. Save it to your device for quick event check-ins.
            </p>
          </div>

          {/* QR Code Display Card */}
          <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute -right-10 -top-10 size-24 rounded-full bg-yellow-400/10 blur-xl group-hover:bg-yellow-400/15 transition-colors" />

            <div className="relative p-6 sm:p-8 space-y-6 bg-white">
              {/* Student Information */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <User className="size-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Student Information</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {studentData ? `${studentData.firstName} ${studentData.lastName}` : 'Student'}
                </h2>
                <p className="text-gray-600 font-medium">
                  ID: {studentData?.studentIdNumber || studentId}
                </p>
              </div>

              {/* QR Code Display */}
              <div className="text-center space-y-4">
                {qrCodeUrl && (
                  <div>
                    <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
                      <Image
                        src={qrCodeUrl}
                        alt="Your DTP Event QR Code"
                        width={320}
                        height={380}
                        className="w-full max-w-[280px] sm:max-w-[320px] h-auto rounded-lg"
                        priority
                      />
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Camera className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-amber-800 text-sm font-semibold mb-1">Save this QR code:</p>
                      <p className="text-amber-700 text-sm leading-relaxed">
                        Screenshot or download this image to use for event check-ins.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={!qrCodeUrl}
                  className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group/btn"
                >
                  <Download className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  Download QR Code
                </Button>

                {/* Trust Indicators */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="size-3 text-green-500" />
                      <span>Ready for Events</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="size-3 text-yellow-500" />
                      <span>Instant Check-in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-1 w-0 bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 group-hover:w-full" />
          </div>
        </div>
      </div>

      

    </div>
  );
}