'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {studentId ? (
        <QRCodeDisplay studentId={studentId} />
      ) : (
        <div className="w-full max-w-sm mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <p className="text-red-600 text-sm">Could not display QR code. Student ID not found.</p>
          </div>
        </div>
      )}

      <Link href="/" className="mt-6 text-amber-600 hover:text-amber-700 text-sm font-medium hover:underline transition-colors">
        Return to Homepage
      </Link>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
} 