'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { typographyVariants, getTypographyVariant } from '@/lib/styles/typography';

// Typography component with consistent variants
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof typographyVariants;
  size?: string;
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  size = 'base',
  as: Component = 'div',
  className,
  children,
  ...props
}: TypographyProps) {
  const variantStyles = getTypographyVariant(variant, size as keyof (typeof typographyVariants)[typeof variant]);
  
  return (
    <Component
      className={cn(
        'font-sans',
        className
      )}
      style={variantStyles}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </Component>
  );
}

// Specific typography components for common use cases
export function Display({
  size = 'lg',
  className,
  children,
  ...props
}: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography
      variant="display"
      size={size}
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function Heading({
  level = 1,
  className,
  children,
  ...props
}: Omit<TypographyProps, 'variant' | 'size'> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const sizeMap = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  } as const;

  const Component = `h${level}` as keyof React.JSX.IntrinsicElements;
  
  return (
    <Typography
      variant="heading"
      size={sizeMap[level]}
      as={Component}
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function Body({
  size = 'base',
  className,
  children,
  ...props
}: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography
      variant="body"
      size={size}
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function UI({
  size = 'base',
  className,
  children,
  ...props
}: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography
      variant="ui"
      size={size}
      className={cn('text-foreground', className)}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function Caption({
  size = 'base',
  className,
  children,
  ...props
}: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography
      variant="caption"
      size={size}
      className={cn('text-muted-foreground', className)}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function Code({
  size = 'base',
  className,
  children,
  ...props
}: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography
      variant="code"
      size={size}
      as="code"
      className={cn(
        'bg-muted px-1.5 py-0.5 rounded text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </Typography>
  );
}

// Typography showcase component for development/testing
export function TypographyShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Typography System</h2>
        
        <div className="space-y-6">
          {/* Display Text */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Display Text</h3>
            <div className="space-y-2">
              <Display size="2xl">Display 2XL - Large hero text</Display>
              <Display size="xl">Display XL - Section headers</Display>
              <Display size="lg">Display LG - Page titles</Display>
              <Display size="md">Display MD - Section titles</Display>
              <Display size="sm">Display SM - Subsection titles</Display>
            </div>
          </section>

          {/* Headings */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Headings</h3>
            <div className="space-y-2">
              <Heading level={1}>Heading 1 - Main page title</Heading>
              <Heading level={2}>Heading 2 - Section title</Heading>
              <Heading level={3}>Heading 3 - Subsection title</Heading>
              <Heading level={4}>Heading 4 - Group title</Heading>
              <Heading level={5}>Heading 5 - Subgroup title</Heading>
              <Heading level={6}>Heading 6 - Small title</Heading>
            </div>
          </section>

          {/* Body Text */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Body Text</h3>
            <div className="space-y-2">
              <Body size="lg">
                Body LG - Large body text for important content and lead paragraphs. 
                This size provides excellent readability for key information.
              </Body>
              <Body size="base">
                Body Base - Standard body text for most content. This is the default 
                size for paragraphs and general text content.
              </Body>
              <Body size="sm">
                Body SM - Smaller body text for secondary content, captions, and 
                less important information.
              </Body>
              <Body size="xs">
                Body XS - Extra small text for fine print, legal text, and 
                very secondary information.
              </Body>
            </div>
          </section>

          {/* UI Text */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">UI Text</h3>
            <div className="space-y-2">
              <UI size="lg">UI LG - Large UI elements like buttons and labels</UI>
              <UI size="base">UI Base - Standard UI text for buttons and controls</UI>
              <UI size="sm">UI SM - Small UI text for secondary controls</UI>
              <UI size="xs">UI XS - Extra small UI text for micro-interactions</UI>
            </div>
          </section>

          {/* Caption Text */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Caption Text</h3>
            <div className="space-y-2">
              <Caption size="base">
                Caption Base - Standard caption text for images, forms, and metadata
              </Caption>
              <Caption size="sm">
                Caption SM - Small caption text for fine details and secondary information
              </Caption>
            </div>
          </section>

          {/* Code Text */}
          <section>
            <h3 className="text-lg font-medium mb-3 text-muted-foreground">Code Text</h3>
            <div className="space-y-2">
              <Code size="base">Code Base - Standard code text for inline code</Code>
              <Code size="sm">Code SM - Small code text for fine details</Code>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
