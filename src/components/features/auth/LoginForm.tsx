'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

export function LoginForm() {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      setSubmitting(true);

      // Simple auth: accept any non-empty credentials (dev-only)
      if (!values.email || !values.password) {
        toast.error('Login Failed', { description: 'Email and password are required' });
        setSubmitting(false);
        return;
      }

      // Optionally enforce a specific admin credential via env (if provided)
      const requiredEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const requiredPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      if (requiredEmail && requiredPassword) {
        if (values.email !== requiredEmail || values.password !== requiredPassword) {
          toast.error('Login Failed', { description: 'Invalid admin credentials' });
          setSubmitting(false);
          return;
        }
      }

      // Set simple auth cookie (1 week) - read by middleware
      const oneWeekSeconds = 60 * 60 * 24 * 7;
      document.cookie = `APP_AUTH=1; Max-Age=${oneWeekSeconds}; Path=/; SameSite=Lax`;

      // Debug logs
      console.log('[Auth Debug] Set APP_AUTH cookie. document.cookie:', document.cookie);

      toast.success('Login Successful', { description: 'Redirecting to your dashboard...' });

      // Hard redirect to ensure fresh server state
      window.location.assign('/admin/dashboard');
    } finally {
      // keep submitting true until navigation to avoid double submit
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}

export default LoginForm; 