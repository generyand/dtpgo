import React from 'react';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizerLoginForm } from '@/components/organizer/OrganizerLoginForm';
import { Toaster } from '@/components/ui/sonner';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Organizer Login - DTP Attendance System',
  description: 'Sign in to access the DTP Attendance organizer panel',
};

export default function OrganizerLoginPage() {
  return (
    <div className="relative fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Elements - Organizer themed */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md px-4 space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 border border-blue-200">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DTP Attendance</h1>
          <p className="text-gray-600 mt-2">Organizer Portal</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your organizer account to manage attendance sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded" />}>
              <OrganizerLoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 University of Mindanao Digos College - DTP</p>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
}
