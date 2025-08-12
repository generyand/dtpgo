'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, StudentFormInput, studentIdRegex } from '@/lib/validations/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

interface Program {
  id: string;
  name: string;
  displayName: string;
}

interface PublicRegisterFormProps {
  onSubmit: (data: StudentFormInput) => Promise<void>;
  isSubmitting: boolean;
}

export const PublicRegisterForm = ({ onSubmit, isSubmitting }: PublicRegisterFormProps) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm<StudentFormInput>({
    resolver: zodResolver(studentSchema),
    mode: 'onBlur',
  });

  const studentIdValue = watch('studentIdNumber');
  const emailValue = watch('email');

  const debouncedStudentId = useDebounce(studentIdValue, 500);
  const debouncedEmail = useDebounce(emailValue, 500);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/admin/programs');
        if (!response.ok) throw new Error('Failed to load programs');
        const data = await response.json();
        setPrograms(data.programs);
      } catch (error) {
        console.error('Failed to load programs:', error);
        toast.error('Could not load programs. Please try again later.');
      }
    };
    fetchPrograms();
  }, []);

  const checkDuplicate = useCallback(async (field: 'email' | 'studentIdNumber', value: string) => {
    if (!value) return;

    if (field === 'studentIdNumber' && !studentIdRegex.test(value)) {
      return;
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return;
    }

    try {
      const response = await fetch('/api/public/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await response.json();
      if (data.isDuplicate) {
        setError(field, { type: 'manual', message: `This ${field === 'email' ? 'email' : 'student ID'} is already registered.` });
      } else {
        clearErrors(field);
      }
    } catch (error) {
      console.error(`Failed to check duplicate for ${field}`, error);
    }
  }, [setError, clearErrors]);

  useEffect(() => {
    checkDuplicate('studentIdNumber', debouncedStudentId);
  }, [debouncedStudentId, checkDuplicate]);

  useEffect(() => {
    checkDuplicate('email', debouncedEmail);
  }, [debouncedEmail, checkDuplicate]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="studentIdNumber">Student ID Number</Label>
        <Input id="studentIdNumber" {...register('studentIdNumber')} placeholder="SXXXX-XXXX-XXX" />
        {errors.studentIdNumber && <p className="text-sm text-red-500">{errors.studentIdNumber.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register('firstName')} placeholder="Juan" />
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register('lastName')} placeholder="Dela Cruz" />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" {...register('email')} placeholder="juan.delacruz@example.com" />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="programId">Program</Label>
          <Select onValueChange={(value) => setValue('programId', value)} name="programId">
            <SelectTrigger>
              <SelectValue placeholder="Select Program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.programId && <p className="text-sm text-red-500">{errors.programId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year Level</Label>
          <Select onValueChange={(value) => setValue('year', parseInt(value, 10))} name="year">
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.year && <p className="text-sm text-red-500">{errors.year.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Register'}
      </Button>
    </form>
  );
}; 