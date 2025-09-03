'use client';

import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  validateSessionNameRealTime,
  validateSessionDescriptionRealTime,
  validateTimeWindowRealTime,
  validateOrganizerAssignment,
  validateSessionConfiguration,
  ValidationResult,
  ValidationSummary,
} from '@/lib/validations/session';

interface UseSessionValidationReturn {
  // Field-level validation
  nameValidation: ValidationResult;
  descriptionValidation: ValidationResult;
  timeInStartValidation: ValidationResult;
  timeInEndValidation: ValidationResult;
  timeOutStartValidation: ValidationResult;
  timeOutEndValidation: ValidationResult;
  organizerValidation: ValidationResult;
  maxCapacityValidation: ValidationResult;
  
  // Form-level validation
  formValidation: ValidationSummary;
  
  // Validation helpers
  isFormValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  
  // Real-time validation functions
  validateField: (fieldName: string, value: any) => ValidationResult;
  validateForm: () => ValidationSummary;
}

export function useSessionValidation(): UseSessionValidationReturn {
  const { control, formState: { errors } } = useFormContext();
  
  // Watch form values for real-time validation
  const watchedValues = useWatch({
    control,
    name: [
      'name',
      'description',
      'timeInStart',
      'timeInEnd',
      'timeOutStart',
      'timeOutEnd',
      'organizerIds',
      'maxCapacity',
      'requireRegistration'
    ]
  });

  const [
    name,
    description,
    timeInStart,
    timeInEnd,
    timeOutStart,
    timeOutEnd,
    organizerIds,
    maxCapacity,
    requireRegistration
  ] = watchedValues || [];

  // Field-level validations
  const nameValidation = useMemo((): ValidationResult => {
    return validateSessionNameRealTime(name || '');
  }, [name]);

  const descriptionValidation = useMemo((): ValidationResult => {
    return validateSessionDescriptionRealTime(description || '');
  }, [description]);

  const timeInStartValidation = useMemo((): ValidationResult => {
    if (!timeInStart || !timeInEnd) {
      return { isValid: false, message: 'Start time is required', type: 'error' };
    }
    return validateTimeWindowRealTime(timeInStart, timeInEnd);
  }, [timeInStart, timeInEnd]);

  const timeInEndValidation = useMemo((): ValidationResult => {
    if (!timeInStart || !timeInEnd) {
      return { isValid: false, message: 'End time is required', type: 'error' };
    }
    return validateTimeWindowRealTime(timeInStart, timeInEnd);
  }, [timeInStart, timeInEnd]);

  const timeOutStartValidation = useMemo((): ValidationResult => {
    if (!timeOutStart || !timeOutEnd) {
      return { isValid: true, message: 'Time-out is optional', type: 'success' };
    }
    if (!timeInEnd) {
      return { isValid: false, message: 'Time-in end is required for time-out', type: 'error' };
    }
    return validateTimeWindowRealTime(timeOutStart, timeOutEnd);
  }, [timeOutStart, timeOutEnd, timeInEnd]);

  const timeOutEndValidation = useMemo((): ValidationResult => {
    if (!timeOutStart || !timeOutEnd) {
      return { isValid: true, message: 'Time-out is optional', type: 'success' };
    }
    if (!timeInEnd) {
      return { isValid: false, message: 'Time-in end is required for time-out', type: 'error' };
    }
    return validateTimeWindowRealTime(timeOutStart, timeOutEnd);
  }, [timeOutStart, timeOutEnd, timeInEnd]);

  const organizerValidation = useMemo((): ValidationResult => {
    return validateOrganizerAssignment(organizerIds || [], maxCapacity);
  }, [organizerIds, maxCapacity]);

  const maxCapacityValidation = useMemo((): ValidationResult => {
    if (requireRegistration && !maxCapacity) {
      return { isValid: false, message: 'Maximum capacity is required when registration is required', type: 'error' };
    }
    if (maxCapacity && maxCapacity < 1) {
      return { isValid: false, message: 'Maximum capacity must be at least 1', type: 'error' };
    }
    if (maxCapacity && maxCapacity > 1000) {
      return { isValid: false, message: 'Maximum capacity cannot exceed 1000', type: 'error' };
    }
    return { isValid: true, message: 'Capacity looks good!', type: 'success' };
  }, [maxCapacity, requireRegistration]);

  // Form-level validation
  const formValidation = useMemo((): ValidationSummary => {
    return validateSessionConfiguration({
      name: name || '',
      description: description || '',
      timeInStart: timeInStart || '',
      timeInEnd: timeInEnd || '',
      timeOutStart: timeOutStart || '',
      timeOutEnd: timeOutEnd || '',
      organizerIds: organizerIds || [],
      maxCapacity: maxCapacity,
      requireRegistration: requireRegistration || false,
    });
  }, [name, description, timeInStart, timeInEnd, timeOutStart, timeOutEnd, organizerIds, maxCapacity, requireRegistration]);

  // Validation helpers
  const isFormValid = useMemo(() => {
    return formValidation.isValid && Object.keys(errors).length === 0;
  }, [formValidation.isValid, errors]);

  const hasErrors = useMemo(() => {
    return formValidation.errors.length > 0 || Object.keys(errors).length > 0;
  }, [formValidation.errors, errors]);

  const hasWarnings = useMemo(() => {
    return formValidation.warnings.length > 0;
  }, [formValidation.warnings]);

  const errorCount = useMemo(() => {
    return formValidation.errors.length + Object.keys(errors).length;
  }, [formValidation.errors, errors]);

  const warningCount = useMemo(() => {
    return formValidation.warnings.length;
  }, [formValidation.warnings]);

  // Validation functions
  const validateField = useCallback((fieldName: string, value: any): ValidationResult => {
    switch (fieldName) {
      case 'name':
        return validateSessionNameRealTime(value || '');
      case 'description':
        return validateSessionDescriptionRealTime(value || '');
      case 'timeInStart':
      case 'timeInEnd':
        if (!timeInStart || !timeInEnd) {
          return { isValid: false, message: 'Both start and end times are required', type: 'error' };
        }
        return validateTimeWindowRealTime(timeInStart, timeInEnd);
      case 'timeOutStart':
      case 'timeOutEnd':
        if (!value) {
          return { isValid: true, message: 'Time-out is optional', type: 'success' };
        }
        if (!timeOutStart || !timeOutEnd) {
          return { isValid: false, message: 'Both time-out start and end are required', type: 'error' };
        }
        return validateTimeWindowRealTime(timeOutStart, timeOutEnd);
      case 'organizerIds':
        return validateOrganizerAssignment(value || [], maxCapacity);
      case 'maxCapacity':
        if (requireRegistration && !value) {
          return { isValid: false, message: 'Maximum capacity is required when registration is required', type: 'error' };
        }
        if (value && value < 1) {
          return { isValid: false, message: 'Maximum capacity must be at least 1', type: 'error' };
        }
        if (value && value > 1000) {
          return { isValid: false, message: 'Maximum capacity cannot exceed 1000', type: 'error' };
        }
        return { isValid: true, message: 'Capacity looks good!', type: 'success' };
      default:
        return { isValid: true, message: 'Field is valid', type: 'success' };
    }
  }, [timeInStart, timeInEnd, timeOutStart, timeOutEnd, maxCapacity, requireRegistration]);

  const validateForm = useCallback((): ValidationSummary => {
    return validateSessionConfiguration({
      name: name || '',
      description: description || '',
      timeInStart: timeInStart || '',
      timeInEnd: timeInEnd || '',
      timeOutStart: timeOutStart || '',
      timeOutEnd: timeOutEnd || '',
      organizerIds: organizerIds || [],
      maxCapacity: maxCapacity,
      requireRegistration: requireRegistration || false,
    });
  }, [name, description, timeInStart, timeInEnd, timeOutStart, timeOutEnd, organizerIds, maxCapacity, requireRegistration]);

  return {
    // Field-level validation
    nameValidation,
    descriptionValidation,
    timeInStartValidation,
    timeInEndValidation,
    timeOutStartValidation,
    timeOutEndValidation,
    organizerValidation,
    maxCapacityValidation,
    
    // Form-level validation
    formValidation,
    
    // Validation helpers
    isFormValid,
    hasErrors,
    hasWarnings,
    errorCount,
    warningCount,
    
    // Real-time validation functions
    validateField,
    validateForm,
  };
}
