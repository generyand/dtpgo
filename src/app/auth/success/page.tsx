'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/loading';
import { CheckCircle } from 'lucide-react';

export default function AuthSuccessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Get user role and redirect accordingly
      const userRole = user.user_metadata?.role;
      
      let redirectPath = '/admin/dashboard'; // Default fallback
      
      switch (userRole) {
        case 'admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'organizer':
          redirectPath = '/organizer/sessions';
          break;
        default:
          redirectPath = '/admin/dashboard';
      }
      
      // Redirect after a short delay to show the success message
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else if (!loading && !user) {
      // If no user after loading, redirect to login
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <Spinner size="md" />
              <span className="text-sm text-muted-foreground">Completing login...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const userRole = user.user_metadata?.role;
  const roleDisplayName = userRole === 'admin' ? 'Administrator' : 
                         userRole === 'organizer' ? 'Organizer' : 'User';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Login Successful!</CardTitle>
          <CardDescription>
            Welcome back, {roleDisplayName}. Redirecting you to your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Spinner size="md" label="Redirecting..." />
        </CardContent>
      </Card>
    </div>
  );
}
