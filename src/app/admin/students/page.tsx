'use client';

import React from 'react';
import StudentsTable from '@/components/admin/StudentsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';

export default function StudentsPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>View, edit, and manage student records.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsTable />
        </CardContent>
      </Card>
      <Toaster richColors />
    </>
  );
} 