import { Metadata } from 'next';
import { Suspense } from 'react';
import { ScanPage } from '@/components/organizer/ScanPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QR Scanner | DTP Attendance Organizer',
  description: 'Scan student QR codes to record attendance for your sessions',
};

export default function ScanPageRoute() {
  return (
    <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 min-w-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">QR Scanner</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Scan student QR codes to record attendance for your sessions
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <QrCode className="h-4 w-4" />
          <span>Organizer Portal</span>
        </div>
      </div>

      {/* Scanner Component */}
      <Suspense fallback={
        <Card>
          <CardHeader>
            <CardTitle>Loading Scanner...</CardTitle>
            <CardDescription>Initializing camera interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </CardContent>
        </Card>
      }>
        <ScanPage />
      </Suspense>
    </div>
  );
}
