'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, StudentFormInput } from '@/lib/validations/student';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Program = {
  id: string;
  name: string;
};

interface PublicRegisterFormProps {
  onSubmit: (data: StudentFormInput) => Promise<void>;
  isSubmitting: boolean;
}

export function PublicRegisterForm({ onSubmit, isSubmitting }: PublicRegisterFormProps) {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch('/api/admin/programs'); // Reuse the admin endpoint for now
        if (!res.ok) throw new Error('Failed to fetch programs');
        const data = await res.json();
        setPrograms(data.programs ?? []);
      } catch (error) {
        toast.error('Failed to load programs');
      }
    }
    fetchPrograms();
  }, []);

  const form = useForm<StudentFormInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentIdNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      year: 1,
      programId: '',
    },
  });

  const handleFormSubmit: SubmitHandler<StudentFormInput> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="studentIdNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student ID</FormLabel>
              <FormControl>
                <Input placeholder="SXXXX-XXXX-XXX" {...field} className="py-6 text-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} className="py-6 text-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} className="py-6 text-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} className="py-6 text-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year Level</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value, 10))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger className="py-6 text-lg">
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="programId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="py-6 text-lg">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full py-6 text-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Register'}
        </Button>
      </form>
    </Form>
  );
}

export default PublicRegisterForm; 