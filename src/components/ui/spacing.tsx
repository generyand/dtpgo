'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { spacingScale, getSpacing } from '@/lib/styles/spacing';

// Spacing component with consistent variants
interface SpacingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof spacingScale;
  type?: 'margin' | 'padding' | 'gap';
  direction?: 'all' | 'x' | 'y' | 'top' | 'right' | 'bottom' | 'left';
  children?: React.ReactNode;
}

export function Spacing({
  size = 4,
  type = 'padding',
  direction = 'all',
  className,
  children,
  ...props
}: SpacingProps) {
  const spacingValue = getSpacing(size);
  
  const getSpacingClasses = () => {
    switch (type) {
      case 'margin':
        switch (direction) {
          case 'all':
            return `m-[${spacingValue}]`;
          case 'x':
            return `mx-[${spacingValue}]`;
          case 'y':
            return `my-[${spacingValue}]`;
          case 'top':
            return `mt-[${spacingValue}]`;
          case 'right':
            return `mr-[${spacingValue}]`;
          case 'bottom':
            return `mb-[${spacingValue}]`;
          case 'left':
            return `ml-[${spacingValue}]`;
          default:
            return `m-[${spacingValue}]`;
        }
      case 'padding':
        switch (direction) {
          case 'all':
            return `p-[${spacingValue}]`;
          case 'x':
            return `px-[${spacingValue}]`;
          case 'y':
            return `py-[${spacingValue}]`;
          case 'top':
            return `pt-[${spacingValue}]`;
          case 'right':
            return `pr-[${spacingValue}]`;
          case 'bottom':
            return `pb-[${spacingValue}]`;
          case 'left':
            return `pl-[${spacingValue}]`;
          default:
            return `p-[${spacingValue}]`;
        }
      case 'gap':
        return `gap-[${spacingValue}]`;
      default:
        return `p-[${spacingValue}]`;
    }
  };

  return (
    <div
      className={cn(
        getSpacingClasses(),
        'border border-dashed border-gray-300 rounded',
        className
      )}
      style={{
        '--spacing-value': spacingValue,
      } as React.CSSProperties}
      {...props}
    >
      {children || (
        <div className="text-xs text-gray-500 text-center">
          {type} {direction}: {spacingValue}
        </div>
      )}
    </div>
  );
}

// Layout spacing components
export function PageSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-[var(--spacing-layout-page)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('my-[var(--spacing-layout-section)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SubsectionSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('my-[var(--spacing-layout-subsection)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function GroupSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('my-[var(--spacing-layout-group)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ItemSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('my-[var(--spacing-layout-item)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Component spacing components
export function CardSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'p-[var(--spacing-card-padding)] m-[var(--spacing-card-margin)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FormFieldSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-[var(--spacing-form-field)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function FormGroupSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-[var(--spacing-form-group)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function FormSectionSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-[var(--spacing-form-section)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Content spacing components
export function TextSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('space-y-[var(--spacing-text-paragraph)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function HeadingSpacing({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-[var(--spacing-text-heading)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Spacing showcase component for development/testing
export function SpacingShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Spacing System</h2>
        
        <div className="space-y-6">
          {/* Spacing Scale */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Spacing Scale</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(spacingScale).map(([key, value]) => (
                <Spacing key={key} size={key as unknown as keyof typeof spacingScale} type="padding">
                  <div className="text-center">
                    <div className="font-mono text-xs text-gray-600">{key}</div>
                    <div className="font-mono text-xs">{value}</div>
                  </div>
                </Spacing>
              ))}
            </div>
          </section>

          {/* Component Spacing */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Component Spacing</h3>
            <div className="space-y-4">
              <CardSpacing className="bg-blue-50 border-blue-200">
                <h4 className="font-medium">Card Spacing</h4>
                <p className="text-sm text-gray-600">Uses card padding and margin tokens</p>
              </CardSpacing>
              
              <FormSectionSpacing>
                <FormGroupSpacing>
                  <FormFieldSpacing>
                    <label className="block text-sm font-medium">Form Field</label>
                    <input type="text" className="w-full p-2 border rounded" placeholder="Input field" />
                  </FormFieldSpacing>
                  
                  <FormFieldSpacing>
                    <label className="block text-sm font-medium">Another Field</label>
                    <input type="text" className="w-full p-2 border rounded" placeholder="Another input" />
                  </FormFieldSpacing>
                </FormGroupSpacing>
              </FormSectionSpacing>
            </div>
          </section>

          {/* Layout Spacing */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Layout Spacing</h3>
            <div className="space-y-4">
              <PageSpacing className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-medium">Page Spacing</h4>
                <p className="text-sm text-gray-600">Uses page margin tokens</p>
              </PageSpacing>
              
              <SectionSpacing className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-medium">Section Spacing</h4>
                <p className="text-sm text-gray-600">Uses section margin tokens</p>
              </SectionSpacing>
              
              <SubsectionSpacing className="bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-medium">Subsection Spacing</h4>
                <p className="text-sm text-gray-600">Uses subsection margin tokens</p>
              </SubsectionSpacing>
            </div>
          </section>

          {/* Direction Examples */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Direction Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Spacing size={4} type="padding" direction="all" className="bg-green-50 border-green-200">
                <div className="text-center">
                  <div className="font-medium">All Sides</div>
                  <div className="text-xs text-gray-600">padding: 16px</div>
                </div>
              </Spacing>
              
              <Spacing size={4} type="padding" direction="x" className="bg-blue-50 border-blue-200">
                <div className="text-center">
                  <div className="font-medium">Horizontal</div>
                  <div className="text-xs text-gray-600">padding-x: 16px</div>
                </div>
              </Spacing>
              
              <Spacing size={4} type="margin" direction="y" className="bg-purple-50 border-purple-200">
                <div className="text-center">
                  <div className="font-medium">Vertical</div>
                  <div className="text-xs text-gray-600">margin-y: 16px</div>
                </div>
              </Spacing>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
