'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
}

interface SessionFormLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

// Individual form section component
export function FormSection({ 
  title, 
  description, 
  children, 
  className,
  required = false,
  error
}: FormSectionProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">
            {title}
            {required && <span className="text-destructive ml-1">*</span>}
          </CardTitle>
        </div>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main form layout component
export function SessionFormLayout({ 
  children, 
  className,
  title = "Session Configuration",
  subtitle = "Configure session details, timing, and organizer assignments"
}: SessionFormLayoutProps) {
  return (
    <div className={cn('w-full max-w-4xl mx-auto space-y-6', className)}>
      {/* Form Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 text-lg">{subtitle}</p>
        )}
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

// Two-column grid layout for form sections
export function FormGrid({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {children}
    </div>
  );
}

// Full-width form section
export function FormSectionFull({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  );
}

// Form divider with optional label
export function FormDivider({ 
  label, 
  className 
}: { 
  label?: string; 
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Separator className="flex-1" />
      {label && (
        <span className="text-sm font-medium text-muted-foreground px-2">
          {label}
        </span>
      )}
      <Separator className="flex-1" />
    </div>
  );
}

// Form field group for related inputs
export function FormFieldGroup({ 
  title, 
  description, 
  children, 
  className 
}: { 
  title?: string; 
  description?: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

// Inline form fields (side by side)
export function FormFieldsInline({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col sm:flex-row gap-4', className)}>
      {children}
    </div>
  );
}

// Form actions container
export function FormActions({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-end gap-3 pt-6 border-t', className)}>
      {children}
    </div>
  );
}

// Form help text
export function FormHelpText({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      {children}
    </p>
  );
}

// Form validation message
export function FormValidationMessage({ 
  message, 
  type = 'error',
  className 
}: { 
  message: string; 
  type?: 'error' | 'warning' | 'info';
  className?: string;
}) {
  const styles = {
    error: 'text-destructive bg-destructive/10 border-destructive/20',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    info: 'text-blue-700 bg-blue-50 border-blue-200'
  };

  return (
    <div className={cn(
      'text-sm p-3 rounded-md border',
      styles[type],
      className
    )}>
      {message}
    </div>
  );
}
