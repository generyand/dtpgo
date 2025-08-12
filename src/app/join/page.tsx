'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicRegisterForm } from '@/components/public/PublicRegisterForm';
import { StudentFormInput } from '@/lib/validations/student';
import { toast } from 'sonner';

export default function PublicJoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRegistration = async (data: StudentFormInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      toast.success('Registration successful!');
      router.push('/join/success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Registration failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PublicRegisterForm onSubmit={handleRegistration} isSubmitting={isSubmitting} />
    </div>
  );
} 