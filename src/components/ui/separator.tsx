"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

// Enhanced separator variants
const SeparatorVariants = {
  default: "bg-border",
  muted: "bg-muted",
  subtle: "bg-muted/50",
  strong: "bg-foreground/20",
  dashed: "border-dashed border-t border-border",
  dotted: "border-dotted border-t border-border",
} as const

interface EnhancedSeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: keyof typeof SeparatorVariants
  size?: 'sm' | 'md' | 'lg'
  spacing?: 'tight' | 'normal' | 'loose'
}

const EnhancedSeparator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  EnhancedSeparatorProps
>(
  (
    { 
      className, 
      orientation = "horizontal", 
      decorative = true, 
      variant = "default",
      size = "md",
      spacing = "normal",
      ...props 
    },
    ref
  ) => {
    const sizeClasses = {
      sm: orientation === "horizontal" ? "h-[1px]" : "w-[1px]",
      md: orientation === "horizontal" ? "h-[2px]" : "w-[2px]",
      lg: orientation === "horizontal" ? "h-[3px]" : "w-[3px]",
    }

    const spacingClasses = {
      tight: "my-2",
      normal: "my-4",
      loose: "my-6",
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0",
          SeparatorVariants[variant],
          sizeClasses[size],
          orientation === "horizontal" ? "w-full" : "h-full",
          orientation === "horizontal" ? spacingClasses[spacing] : "mx-4",
          className
        )}
        {...props}
      />
    )
  }
)
EnhancedSeparator.displayName = "EnhancedSeparator"

// Content separator with text
interface ContentSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  variant?: keyof typeof SeparatorVariants
  size?: 'sm' | 'md' | 'lg'
  textClassName?: string
}

const ContentSeparator = React.forwardRef<HTMLDivElement, ContentSeparatorProps>(
  ({ className, text, variant = "default", size = "md", textClassName, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-[1px]",
      md: "h-[2px]",
      lg: "h-[3px]",
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div
          className={cn(
            "flex-1",
            sizeClasses[size],
            SeparatorVariants[variant]
          )}
        />
        {text && (
          <span
            className={cn(
              "text-xs font-medium text-muted-foreground whitespace-nowrap",
              textClassName
            )}
          >
            {text}
          </span>
        )}
        <div
          className={cn(
            "flex-1",
            sizeClasses[size],
            SeparatorVariants[variant]
          )}
        />
      </div>
    )
  }
)
ContentSeparator.displayName = "ContentSeparator"

// Section separator with title
interface SectionSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  variant?: keyof typeof SeparatorVariants
  size?: 'sm' | 'md' | 'lg'
  showLine?: boolean
}

const SectionSeparator = React.forwardRef<HTMLDivElement, SectionSeparatorProps>(
  ({ 
    className, 
    title, 
    description, 
    variant = "default", 
    size = "md", 
    showLine = true,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "h-[1px]",
      md: "h-[2px]",
      lg: "h-[3px]",
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-3", className)}
        {...props}
      >
        {showLine && (
          <div
            className={cn(
              "w-full",
              sizeClasses[size],
              SeparatorVariants[variant]
            )}
          />
        )}
        {(title || description) && (
          <div className="text-center space-y-1">
            {title && (
              <h3 className="text-sm font-medium text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {showLine && (
          <div
            className={cn(
              "w-full",
              sizeClasses[size],
              SeparatorVariants[variant]
            )}
          />
        )}
      </div>
    )
  }
)
SectionSeparator.displayName = "SectionSeparator"

export {
  Separator,
  EnhancedSeparator,
  ContentSeparator,
  SectionSeparator,
}
