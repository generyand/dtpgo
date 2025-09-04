'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Search, AlertCircle, CheckCircle, Clock, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { 
  validateStudentIdFormat, 
  validateStudentExists, 
  searchStudents
} from '@/lib/scanning/student-validation';
import { ScanningStudent } from '@/lib/types/scanning';
import { ScanActionType } from '@/lib/types/scanning';

// Form validation schema
const manualEntrySchema = z.object({
  studentId: z.string()
    .min(1, 'Student ID is required')
    .regex(/^S\d{3}-\d{4}-\d{3}$/, 'Student ID must be in format S000-0000-000'),
});

type ManualEntryFormData = z.infer<typeof manualEntrySchema>;

interface ManualEntryProps {
  sessionId: string;
  organizerId: string;
  onScanProcessed: (result: {
    success: boolean;
    student?: ScanningStudent;
    scanType?: ScanActionType;
    message: string;
    error?: string;
  }) => void;
  onBackToQR?: () => void;
  className?: string;
}

export function ManualEntry({
  sessionId,
  organizerId,
  onScanProcessed,
  onBackToQR,
  className = '',
}: ManualEntryProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validatedStudent, setValidatedStudent] = useState<ScanningStudent | null>(null);
  const [searchResults, setSearchResults] = useState<ScanningStudent[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    clearErrors,
  } = useForm<ManualEntryFormData>({
    resolver: zodResolver(manualEntrySchema),
    mode: 'onChange',
  });

  const studentIdValue = watch('studentId');

  // Real-time validation as user types
  useEffect(() => {
    if (studentIdValue && studentIdValue.length >= 13) {
      const formatValidation = validateStudentIdFormat(studentIdValue);
      if (formatValidation.isValid) {
        clearErrors('studentId');
      }
    }
  }, [studentIdValue, clearErrors]);

  // Handle student ID validation
  const handleStudentIdValidation = async (studentId: string) => {
    setIsValidating(true);
    setValidatedStudent(null);

    try {
      // First validate format
      const formatValidation = validateStudentIdFormat(studentId);
      if (!formatValidation.isValid) {
        toast.error(formatValidation.error || 'Invalid student ID format');
        return;
      }

      // Then validate existence in database
      const dbValidation = await validateStudentExists(formatValidation.normalizedId!);
      if (!dbValidation.isValid) {
        toast.error(dbValidation.error || 'Student not found');
        return;
      }

      setValidatedStudent(dbValidation.student!);
      toast.success(`Student validated: ${dbValidation.student!.fullName}`);
    } catch (error) {
      console.error('Error validating student:', error);
      toast.error('Error validating student. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle search functionality
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const results = await searchStudents(query, { limit: 5 });
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Error searching students');
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (student: ScanningStudent) => {
    setValue('studentId', student.studentId);
    setValidatedStudent(student);
    setShowSearchResults(false);
    setSearchQuery('');
    clearErrors('studentId');
    toast.success(`Student selected: ${student.fullName}`);
  };

  // Handle form submission
  const onSubmit = async (data: ManualEntryFormData) => {
    if (!validatedStudent) {
      await handleStudentIdValidation(data.studentId);
      return;
    }

    setIsProcessing(true);

    try {
      // Process the scan using the same API as QR scanning
      const response = await fetch('/api/scanning/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData: `DTP_STUDENT:${validatedStudent.studentId}`,
          sessionId,
          organizerId,
          metadata: {
            deviceInfo: 'Manual Entry',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        onScanProcessed({
          success: true,
          student: validatedStudent,
          scanType: result.result.scanType.type,
          message: result.result.message,
        });
        toast.success('Scan processed successfully!');
        
        // Reset form
        setValidatedStudent(null);
        setValue('studentId', '');
      } else {
        onScanProcessed({
          success: false,
          student: validatedStudent,
          message: result.message || 'Scan processing failed',
          error: result.error,
        });
        toast.error(result.message || 'Scan processing failed');
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      onScanProcessed({
        success: false,
        student: validatedStudent,
        message: 'Error processing scan',
        error: 'Network error',
      });
      toast.error('Error processing scan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <QrCode className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Manual Student Entry</h2>
        <p className="text-gray-600 mt-2">
          Enter student ID manually when QR scanning is not available
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Student</span>
          </CardTitle>
          <CardDescription>
            Search for a student by name, ID, or email to quickly find and select them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Student</Label>
              <Input
                id="search"
                type="text"
                placeholder="Enter student name, ID, or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="mt-1"
              />
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Results</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSearchResultSelect(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.fullName}</p>
                          <p className="text-sm text-gray-600">{student.studentId}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                        <Badge variant="secondary">{student.program}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No students found matching &quot;{searchQuery}&quot;
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Student ID</CardTitle>
          <CardDescription>
            Enter the student ID in format S000-0000-000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="S000-0000-000"
                {...register('studentId')}
                className={`mt-1 ${errors.studentId ? 'border-red-500' : ''}`}
                disabled={isValidating || isProcessing}
              />
              {errors.studentId && (
                <p className="text-red-500 text-sm mt-1">{errors.studentId.message}</p>
              )}
            </div>

            {/* Validation Button */}
            {studentIdValue && isValid && !validatedStudent && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleStudentIdValidation(studentIdValue)}
                disabled={isValidating}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validate Student
                  </>
                )}
              </Button>
            )}

            {/* Validated Student Display */}
            {validatedStudent && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-medium">Student Validated</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {validatedStudent.fullName}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {validatedStudent.studentId}
                      </div>
                      <div>
                        <span className="font-medium">Program:</span> {validatedStudent.program}
                      </div>
                      <div>
                        <span className="font-medium">Year:</span> {validatedStudent.year}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {onBackToQR && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBackToQR}
                  disabled={isValidating || isProcessing}
                  className="flex-1"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Back to QR Scan
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={!validatedStudent || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Process Scan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Use the search function to quickly find students by name, ID, or email</p>
            <p>• Enter student ID in the format: S000-0000-000</p>
            <p>• Validate the student before processing the scan</p>
            <p>• The system will automatically determine if it&apos;s a Time-In or Time-Out scan</p>
            <p>• Duplicate scans are prevented automatically</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
