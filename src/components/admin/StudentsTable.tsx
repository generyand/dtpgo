'use client';

import React, { useState, useEffect } from 'react';
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
import { MoreHorizontal } from 'lucide-react';
import type { StudentWithProgram } from '@/lib/db/queries/students';
import { toast } from 'sonner';
import EditStudentModal from './EditStudentModal';

export function StudentsTable() {
  const [students, setStudents] = useState<StudentWithProgram[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentWithProgram | null>(null);

  async function fetchStudents() {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
      });
      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data.students ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      toast.error('Failed to load students');
    }
  }
  
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
      toast.error('Failed to delete student');
    }
  }
  
  useEffect(() => {
    fetchStudents();
  }, [page, limit, search]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.studentIdNumber}</TableCell>
                <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.program.name}</TableCell>
                <TableCell>{student.year}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
    </div>
  );
}

export default StudentsTable; 