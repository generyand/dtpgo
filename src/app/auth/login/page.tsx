import React from 'react';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { Toaster } from '@/components/ui/sonner';
import { Shield, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login - DTP Attendance System',
  description: 'Sign in to access the DTP Attendance admin panel',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DTP Attendance</h1>
          <p className="text-gray-600 mt-2">Department of Technology Programs</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to your admin account to access the attendance system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded" />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 University of Malaya - Department of Technology Programs</p>
          <p className="mt-1">Secure authentication powered by Supabase</p>
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
} 