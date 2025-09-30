import { Metadata } from 'next';
import { Suspense } from 'react';
import { ScanPage } from '@/components/organizer/ScanPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, QrCode, Camera } from 'lucide-react';

export const metadata: Metadata = {
  title: 'QR Scanner | DTP Attendance Organizer',
  description: 'Scan student QR codes to record attendance for your sessions',
};

export default function ScanPageRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <QrCode className="h-8 w-8 text-orange-600" />
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Camera className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              DTP Attendance System
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Organizer Portal - QR Code Scanner
            </p>
            <p className="text-sm text-gray-500 mt-1">
              University of Mindanao Digos College
            </p>
          </div>

          {/* Scanner Component */}
          <Suspense fallback={
            <Card className="w-full max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Loading QR Scanner...</CardTitle>
                <CardDescription>Please wait while we initialize the scanner interface.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          }>
            <ScanPage />
          </Suspense>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>© 2025 University of Mindanao Digos College - DTP. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
