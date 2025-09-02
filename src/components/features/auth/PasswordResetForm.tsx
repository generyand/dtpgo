'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { passwordResetRequestSchema, PasswordResetRequestInput } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail, AlertCircle } from 'lucide-react';
import { getAuthErrorMessage, logAuthError } from '@/lib/auth/error-handling';

interface PasswordResetFormProps {
  showBackToLogin?: boolean;
}

export function PasswordResetForm({ showBackToLogin = true }: PasswordResetFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: PasswordResetRequestInput) {
    if (submitting || authLoading) return;

    try {
      setSubmitting(true);
      setError(null);

      const result = await resetPassword(values.email);

      if (result.error) {
        const errorMessage = getAuthErrorMessage(result.error);
        setError(errorMessage);
        
        // Log the error for monitoring
        logAuthError(result.error, {
          action: 'password_reset_attempt',
          ipAddress: 'client-side',
        });
        
        toast.error('Reset Failed', { 
          description: errorMessage
        });
        return;
      }

      setEmailSent(true);
      toast.success('Reset Email Sent', { 
        description: 'Check your email for password reset instructions'
      });

      // Reset form
      form.reset();
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error);
      setError(errorMessage);
      
      // Log the error for monitoring
      logAuthError(error, {
        action: 'password_reset_attempt',
        ipAddress: 'client-side',
      });
      
      toast.error('Reset Failed', { 
        description: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  }

  const isLoading = submitting || authLoading;

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent password reset instructions to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>Didn&apos;t receive the email? Check your spam folder or</p>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={() => setEmailSent(false)}
            >
              try again
            </Button>
          </div>
          
          {showBackToLogin && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/auth/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="admin@dtp.edu.my"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            {showBackToLogin && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/login')}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default PasswordResetForm;
