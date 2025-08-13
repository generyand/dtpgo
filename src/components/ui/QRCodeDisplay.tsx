'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Download, CheckCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  studentId: string;
}

export function QRCodeDisplay({ studentId }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchQRCode = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const qrResponse = await fetch(`/api/students/${studentId}/qr`);
        if (!qrResponse.ok) {
          throw new Error('Failed to load QR code.');
        }
        const blob = await qrResponse.blob();
        setQrCodeUrl(URL.createObjectURL(blob));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRCode();

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
      link.download = `dtp-qr-code-${studentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-amber-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Generating your QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto px-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-3">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Compact Success Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-4 py-5 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Registration Successful!</h2>
          <p className="text-green-700 text-xs font-medium">Welcome to DTP Events</p>
        </div>

        {/* Condensed Welcome Message */}
        <div className="px-4 py-3 text-center bg-gray-50/50">
          <p className="text-gray-600 text-xs leading-relaxed">
            🎉 You&apos;re all set! Your personalized QR code is ready for event check-ins.
          </p>
        </div>

        {/* Optimized QR Code Display */}
        <div className="px-4 py-5">
          {qrCodeUrl && (
            <div className="mb-4">
              {/* Mobile: Show QR at optimal size, Desktop: Larger */}
              <div className="relative">
                <Image 
                  src={qrCodeUrl} 
                  alt="Your DTP Event QR Code" 
                  width={300} 
                  height={420}
                  className="mx-auto w-full max-w-[280px] sm:max-w-[320px] h-auto rounded-xl shadow-md"
                  priority
                />
              </div>
            </div>
          )}
          
          {/* Compact instruction */}
          <p className="text-gray-500 text-xs text-center mb-4 px-2">
            Save to your device for quick event access
          </p>

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