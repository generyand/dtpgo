'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, QrCode } from 'lucide-react';
import type { StudentWithProgram } from '@/lib/db/queries/students';
import { toast } from 'sonner';
import EditStudentModal from './EditStudentModal';
import { FilterParams } from './StudentsFilter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';

interface StudentsTableProps {
  searchQuery?: string;
  filters?: FilterParams;
}

export function StudentsTable({ searchQuery = '', filters = {} }: StudentsTableProps) {
  const [students, setStudents] = useState<StudentWithProgram[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [editingStudent, setEditingStudent] = useState<StudentWithProgram | null>(null);
  const [viewingQRStudent, setViewingQRStudent] = useState<StudentWithProgram | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchQuery,
      });

      // Add filter parameters
      if (filters.program) params.set('program', filters.program);
      if (filters.year) params.set('year', filters.year);
      if (filters.registrationSource) params.set('registrationSource', filters.registrationSource);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data.students ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    }
  }, [page, limit, searchQuery, filters]);
  
  async function handleDelete(studentId: string) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete student');
      toast.success('Student deleted successfully');
      fetchStudents(); // Refresh the table
    } catch (error) {
      console.error('Failed to delete student:', error);
      toast.error('Failed to delete student');
    }
  }
  
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setPage(1); // Reset to first page when search or filters change
  }, [searchQuery, filters]);

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {students.map((student) => (
          <div key={student.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {student.studentIdNumber}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{student.email}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{student.program.name}</span>
                  <span>Year {student.year}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewingQRStudent(student)}>
                    <QrCode className="mr-2 h-4 w-4" />
                    View QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(student.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Student ID</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Program</TableHead>
                  <TableHead className="min-w-[60px]">Year</TableHead>
                  <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentIdNumber}</TableCell>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell className="text-gray-600">{student.email}</TableCell>
                    <TableCell>{student.program.name}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingQRStudent(student)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(student.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {students.length} of {total} students
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => (total > prev * limit ? prev + 1 : prev))}
            disabled={total <= page * limit}
          >
            Next
          </Button>
        </div>
      </div>
      <EditStudentModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onUpdate={() => {
          toast.success('Student updated successfully');
          fetchStudents(); // Refresh the table data
        }}
      />
      
      {/* QR Code Modal */}
      <Dialog open={!!viewingQRStudent} onOpenChange={() => setViewingQRStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code - {viewingQRStudent ? `${viewingQRStudent.firstName} ${viewingQRStudent.lastName}` : ''}
            </DialogTitle>
          </DialogHeader>
          {viewingQRStudent && (
            <div className="mt-4">
              <QRCodeDisplay studentId={viewingQRStudent.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentsTable; 