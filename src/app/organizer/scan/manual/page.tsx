import { Metadata } from 'next';
import { Suspense } from 'react';
import { ManualEntryPage } from '@/components/scanning/ManualEntryPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, QrCode } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manual Entry | DTP Attendance Organizer',
  description: 'Manual student entry for attendance scanning when QR codes are not available',
};

export default function ManualEntryPageRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
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
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              DTP Attendance System
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Organizer Portal - Manual Student Entry
            </p>
            <p className="text-sm text-gray-500 mt-1">
              University of Mindanao Digos College
            </p>
          </div>

          {/* Manual Entry Component */}
          <Suspense fallback={
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>Loading Manual Entry...</CardTitle>
                <CardDescription>Please wait while we load the manual entry interface.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          }>
            <ManualEntryPage />
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
