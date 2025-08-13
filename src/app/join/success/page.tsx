'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Thank you for registering. Your information has been submitted successfully. Below is your QR code for event check-in.
      </p>

      {studentId ? (
        <QRCodeDisplay studentId={studentId} />
      ) : (
        <p className="text-red-500">Could not display QR code. Student ID not found.</p>
      )}

      <Link href="/" className="mt-8 text-blue-500 hover:underline">
        Return to Homepage
      </Link>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
} 