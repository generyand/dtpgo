'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Download, CheckCircle, Camera, User } from 'lucide-react';

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

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch QR code
        const qrResponse = await fetch(`/api/students/${studentId}/qr`);
        if (!qrResponse.ok) {
          throw new Error('Failed to load QR code.');
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
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
    // The qrCodeUrl is intentionally omitted from the dependency array to prevent an infinite loop.
    // The cleanup function correctly uses the value from the previous render to revoke the old URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

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
      <div className="w-full max-w-md mx-auto px-2 sm:px-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-amber-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Generating your QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto px-2 sm:px-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Compact Success Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-3 py-4 sm:px-4 sm:py-5 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Registration Successful!</h2>
          <p className="text-green-700 text-xs font-medium">Welcome to DTP Events! Your QR code is ready for future use.</p>
        </div>

        {/* Student Information Display (Simplified, Plain Text, Centered) */}
        <div className="px-3 py-3 sm:px-4 sm:py-3 border-b border-gray-100 text-center">
          <p className="text-lg font-semibold text-gray-900">
            {studentData ? `${studentData.firstName} ${studentData.lastName}` : 'Loading...'}
          </p>
          <p className="text-sm font-medium mt-1">
            ID: {studentData?.studentIdNumber || studentId}
          </p>
        </div>

        {/* Optimized QR Code Display */}
        <div className="px-3 py-4 sm:px-4 sm:py-5">
          {qrCodeUrl && (
            <div className="mb-3 sm:mb-4">
              {/* Clean QR code with logo - Maximize mobile size */}
              <div className="relative">
                <Image
                  src={qrCodeUrl}
                  alt="Your DTP Event QR Code"
                  width={320}
                  height={380}
                  className="mx-auto w-full max-w-[300px] sm:max-w-[320px] h-auto rounded-xl"
                  priority
                />
              </div>
            </div>
          )}

          {/* Screenshot/Download Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
            <div className="flex items-start gap-2">
              <Camera className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-amber-700 text-xs leading-relaxed">
                <strong>Save this QR code:</strong> Screenshot or download this image to use for event check-ins.
              </p>
            </div>
          </div>

          {/* Enhanced Mobile Download Button */}
          <Button
            onClick={handleDownload}
            disabled={!qrCodeUrl}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium shadow-md hover:shadow-lg active:shadow-sm transition-all duration-150 touch-manipulation"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
} 