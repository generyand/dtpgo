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

      const responseData = await response.json();

      if (!response.ok) {
        // Handle different error types with specific messages
        switch (response.status) {
          case 400:
            // Validation errors
            if (typeof responseData.error === 'object') {
              const fieldErrors = Object.entries(responseData.error)
                .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
                .join('\n');
              toast.error(`Please fix the following errors:\n${fieldErrors}`);
            } else {
              toast.error('Please check your input and try again.');
            }
            break;
          case 409:
            // Duplicate entry
            toast.error(responseData.error || 'A student with this information already exists.');
            break;
          case 500:
            // Server error
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(responseData.error || 'Registration failed. Please try again.');
        }
        return;
      }

      const { student } = responseData;
      
      // Validate that we received a valid student object
      if (!student || !student.id) {
        toast.error('Registration completed but could not generate QR code. Please contact support.');
        return;
      }

      toast.success('Registration successful! Redirecting to your QR code...');
      
      // Add a small delay to let the user see the success message
      setTimeout(() => {
        router.push(`/join/success?studentId=${student.id}&name=${encodeURIComponent(student.firstName + ' ' + student.lastName)}`);
      }, 1000);

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast.error(`Registration failed: ${errorMessage}`);
      }
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