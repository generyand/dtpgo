'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Download } from 'lucide-react';

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
        const response = await fetch(`/api/students/${studentId}/qr`);
        if (!response.ok) {
          throw new Error('Failed to load QR code.');
        }
        const blob = await response.blob();
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
  }, [studentId, qrCodeUrl]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${studentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading QR Code...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {qrCodeUrl && (
        <Image src={qrCodeUrl} alt={`QR Code for student ${studentId}`} className="max-w-xs border rounded-lg" width={200} height={200} />
      )}
      <Button onClick={handleDownload} disabled={!qrCodeUrl}>
        <Download className="mr-2 h-4 w-4" />
        Download QR Code
      </Button>
    </div>
  );
} 