'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import RegisterForm from './RegisterForm';
import type { StudentFormInput } from '@/lib/validations/student';
import type { StudentWithProgram } from '@/lib/db/queries/students';
import { toast } from 'sonner';

interface EditStudentModalProps {
  student: StudentWithProgram | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditStudentModal({ student, isOpen, onClose, onUpdate }: EditStudentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: StudentFormInput) {
    if (!student) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update student');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update student:', error);
      toast.error('Failed to update student');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update the details for {student?.firstName} {student?.lastName}.
          </DialogDescription>
        </DialogHeader>
        {student && (
          <RegisterForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={{
              ...student,
              year: student.year,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default EditStudentModal; 