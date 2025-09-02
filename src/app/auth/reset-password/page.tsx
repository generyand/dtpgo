import { Metadata } from 'next';
import { Suspense } from 'react';
import { PasswordResetForm } from '@/components/features/auth/PasswordResetForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Password | DTP Attendance',
  description: 'Reset your password for the DTP Attendance system',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            DTP Attendance System
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            University of Malaya
          </p>
        </div>

        {/* Password Reset Form */}
        <Suspense fallback={
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load the reset form.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        }>
          <PasswordResetForm />
        </Suspense>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 DTP Attendance System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
