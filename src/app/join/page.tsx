'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicRegisterForm from '@/components/public/PublicRegisterForm';
import type { StudentFormInput } from '@/lib/validations/student';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(data: StudentFormInput) {
    setIsSubmitting(true);
    try {
      // API call to public registration endpoint will go here in a future task
      console.log('Registering student:', data);
      toast.success('Registration Successful!');
      router.push('/join/success'); // Redirect to success page
    } catch (error) {
      toast.error('Registration Failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Student Registration</CardTitle>
          <CardDescription>Enter your details to register for the event.</CardDescription>
        </CardHeader>
        <CardContent>
          <PublicRegisterForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
      <Toaster richColors />
    </>
  );
} 