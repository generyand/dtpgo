import React from 'react';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { Toaster } from '@/components/ui/sonner';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login - DTP Attendance System',
  description: 'Sign in to access the DTP Attendance system',
};

export default function LoginPage() {
  return (
    <div className="relative fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Elements - Matching landing page exactly */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 dark:bg-yellow-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md px-4 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
            <GraduationCap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DTP Attendance</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">University of Mindanao Digos College</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">
              Sign in to your account to access the attendance system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 University of Mindanao Digos College - DTP</p>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
} 