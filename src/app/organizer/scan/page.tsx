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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
      
      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Simplified Modern Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              QR Scanner
            </h1>
            <p className="text-blue-200/80 text-sm sm:text-base">
              University of Mindanao Digos College - DTP Attendance
            </p>
          </div>

          {/* Scanner Component */}
          <Suspense fallback={
            <Card className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white">Loading Scanner...</CardTitle>
                <CardDescription className="text-blue-200/70">Initializing camera interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-64 bg-white/10 rounded-2xl"></div>
                  <div className="h-12 bg-white/10 rounded-xl"></div>
                  <div className="h-8 bg-white/10 rounded-xl"></div>
                </div>
              </CardContent>
            </Card>
          }>
            <ScanPage />
          </Suspense>

          {/* Minimalist Footer */}
          <div className="text-center text-xs text-blue-300/50 pt-4">
            <p>© 2025 UM Digos College - DTP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
