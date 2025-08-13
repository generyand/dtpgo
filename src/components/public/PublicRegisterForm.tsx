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
import { User, Mail, GraduationCap, Calendar, CheckCircle, Zap, AlertCircle } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  displayName: string;
}

interface PublicRegisterFormProps {
  onSubmit: (data: StudentFormInput) => Promise<void>;
  isSubmitting: boolean;
}

// Popular email domains with gmail.com at top
const EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
];

// Utility function to capitalize names
const capitalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\b(de|del|dela|van|von|da|di|du|le|la)\b/gi, match => match.toLowerCase());
};

export const PublicRegisterForm = ({ onSubmit, isSubmitting }: PublicRegisterFormProps) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setError,
    clearErrors,
    setValue,
  } = useForm<StudentFormInput>({
    resolver: zodResolver(studentSchema),
    mode: 'onChange', // Changed from 'onBlur' to 'onChange' for real-time validation
  });

  const studentIdValue = watch('studentIdNumber');
  const emailValue = watch('email');
  const firstNameValue = watch('firstName');
  const lastNameValue = watch('lastName');
  const programIdValue = watch('programId');

  const debouncedStudentId = useDebounce(studentIdValue, 500);
  const debouncedEmail = useDebounce(emailValue, 500);

  // Get selected program's short name for display
  const selectedProgram = programs.find(p => p.id === programIdValue);
  const selectedProgramDisplay = selectedProgram ? selectedProgram.name : '';

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;
  const isFormDisabled = isSubmitting || hasErrors || !isValid;

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

  // Auto-capitalize first name
  useEffect(() => {
    if (firstNameValue && firstNameValue !== capitalizeName(firstNameValue)) {
      setValue('firstName', capitalizeName(firstNameValue));
    }
  }, [firstNameValue, setValue]);

  // Auto-capitalize last name
  useEffect(() => {
    if (lastNameValue && lastNameValue !== capitalizeName(lastNameValue)) {
      setValue('lastName', capitalizeName(lastNameValue));
    }
  }, [lastNameValue, setValue]);

  // Email domain suggestions logic
  useEffect(() => {
    if (emailValue && emailValue.includes('@')) {
      const [localPart, domainPart] = emailValue.split('@');
      if (domainPart && domainPart.length > 0) {
        const suggestions = EMAIL_DOMAINS
          .filter(domain => domain.toLowerCase().startsWith(domainPart.toLowerCase()))
          .map(domain => `${localPart}@${domain}`);
        setEmailSuggestions(suggestions);
        setShowEmailSuggestions(suggestions.length > 0 && domainPart !== domainPart.toLowerCase());
      } else {
        setShowEmailSuggestions(false);
      }
    } else if (emailValue && !emailValue.includes('@')) {
      // Show suggestions when user starts typing without @
      const suggestions = EMAIL_DOMAINS.map(domain => `${emailValue}@${domain}`);
      setEmailSuggestions(suggestions);
      setShowEmailSuggestions(emailValue.length > 0);
    } else {
      setShowEmailSuggestions(false);
    }
  }, [emailValue]);

  const selectEmailSuggestion = (suggestion: string) => {
    setValue('email', suggestion);
    setShowEmailSuggestions(false);
    clearErrors('email');
  };

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

  const handleFormSubmit = async (data: StudentFormInput) => {
    try {
      setRegistrationSuccess(false);
      await onSubmit(data);
      setRegistrationSuccess(true);
      // Success feedback will be handled by the parent component
    } catch (error) {
      setRegistrationSuccess(false);
      // Error feedback will be handled by the parent component
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-amber-50 min-h-screen py-8 px-4">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-800 text-sm font-medium mb-4">
            <Zap className="size-4" />
            <span>Join DTP Events</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            <span className="text-gray-900">Student </span>
            <span className="text-yellow-500">Registration</span>
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
            Register now to get your personalized QR code for seamless event check-ins.
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute -right-10 -top-10 size-24 rounded-full bg-yellow-400/10 blur-xl group-hover:bg-yellow-400/15 transition-colors" />
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="relative p-6 sm:p-8 space-y-6">
            {/* Student ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <User className="size-4 text-yellow-600" />
                <Label htmlFor="studentIdNumber" className="font-semibold text-gray-900">Student ID Number</Label>
              </div>
              <Input 
                id="studentIdNumber" 
                {...register('studentIdNumber')} 
                placeholder="Input your student ID number"
                className="h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400/20 transition-colors"
              />
              {errors.studentIdNumber && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="size-4">⚠️</span>
                  {errors.studentIdNumber.message}
                </p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-semibold text-gray-900">First Name</Label>
                <Input 
                  id="firstName" 
                  {...register('firstName')} 
                  placeholder="Juan"
                  className="h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400/20 transition-colors"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="size-4">⚠️</span>
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-semibold text-gray-900">Last Name</Label>
                <Input 
                  id="lastName" 
                  {...register('lastName')} 
                  placeholder="Dela Cruz"
                  className="h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400/20 transition-colors"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="size-4">⚠️</span>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email with Suggestions */}
            <div className="space-y-2 relative">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="size-4 text-yellow-600" />
                <Label htmlFor="email" className="font-semibold text-gray-900">Email Address</Label>
              </div>
              <Input 
                id="email" 
                type="email" 
                {...register('email')} 
                placeholder="juan.delacruz@gmail.com"
                className="h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400/20 transition-colors"
                onFocus={() => emailValue && setShowEmailSuggestions(emailSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
              />
              
              {/* Email Suggestions Dropdown */}
              {showEmailSuggestions && emailSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {emailSuggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-yellow-50 hover:text-yellow-800 transition-colors text-sm border-b border-gray-100 last:border-b-0"
                      onClick={() => selectEmailSuggestion(suggestion)}
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="size-3 text-gray-400" />
                        {suggestion}
                        {index === 0 && suggestion.includes('gmail.com') && (
                          <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Popular</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="size-4">⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Program and Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="size-4 text-yellow-600" />
                  <Label htmlFor="programId" className="font-semibold text-gray-900">Program</Label>
                </div>
                <Select onValueChange={(value) => setValue('programId', value, { shouldValidate: true })} {...register('programId')}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400/20">
                    <SelectValue placeholder="Select your program" className="truncate text-left">
                      {selectedProgramDisplay || "Select your program"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-[400px]">
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="hover:bg-yellow-50 py-3">
                        <div className="flex flex-col items-start gap-0.5 w-full">
                          <span className="font-medium text-sm leading-tight truncate w-full">{p.name}</span>
                          <span className="text-xs text-gray-400 leading-tight truncate w-full">({p.displayName})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="size-4">⚠️</span>
                    {errors.programId.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-yellow-600" />
                  <Label htmlFor="year" className="font-semibold text-gray-900">Year Level</Label>
                </div>
                <Select onValueChange={(value) => setValue('year', parseInt(value, 10), { shouldValidate: true })} {...register('year')}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-yellow-400 focus:ring-yellow-400/20">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((y) => (
                      <SelectItem key={y} value={String(y)} className="hover:bg-yellow-50">
                        <span className="font-medium">{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="size-4">⚠️</span>
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            {/* Validation Error Summary */}
            {hasErrors && !isSubmitting && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 text-sm font-semibold mb-1">Please fix the following errors:</p>
                    <ul className="text-red-700 text-sm space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isFormDisabled}
                className={`w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group/btn ${
                  isFormDisabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 hover:shadow-lg' 
                    : registrationSuccess
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                    <span>Registering...</span>
                  </div>
                ) : registrationSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4" />
                    <span>Registration Successful!</span>
                  </div>
                ) : isFormDisabled ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    <span>Please complete all required fields</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-4 group-hover/btn:scale-110 transition-transform" />
                    <span>Complete Registration</span>
                  </div>
                )}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="size-3 text-green-500" />
                  <span>Secure Registration</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="size-3 text-green-500" />
                  <span>Instant QR Code</span>
                </div>
              </div>
            </div>
          </form>

          {/* Bottom Accent Line */}
          <div className={`h-1 w-0 transition-all duration-500 group-hover:w-full ${
            registrationSuccess 
              ? 'bg-gradient-to-r from-green-400 to-green-500' 
              : isFormDisabled 
              ? 'bg-gradient-to-r from-gray-300 to-gray-400'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
          }`} />
        </div>
      </div>
    </div>
  );
}; 