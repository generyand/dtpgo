import * as React from "react"

import { cn } from "@/lib/utils"

// Card variants for different use cases
const cardVariants = {
  default: "bg-card text-card-foreground border shadow-sm",
  elevated: "bg-card text-card-foreground border-0 shadow-lg",
  outlined: "bg-transparent text-foreground border-2 border-border shadow-none",
  ghost: "bg-transparent text-foreground border-0 shadow-none",
  filled: "bg-muted/50 text-foreground border-0 shadow-none",
} as const

// Card sizes for consistent spacing
const cardSizes = {
  sm: "rounded-lg p-4 gap-4",
  md: "rounded-xl p-6 gap-6",
  lg: "rounded-2xl p-8 gap-8",
  xl: "rounded-3xl p-10 gap-10",
} as const

interface CardProps extends React.ComponentProps<"div"> {
  variant?: keyof typeof cardVariants
  size?: keyof typeof cardSizes
  interactive?: boolean
  hoverable?: boolean
}

function Card({ 
  className, 
  variant = "default", 
  size = "md", 
  interactive = false,
  hoverable = false,
  ...props 
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col border transition-all duration-200",
        cardVariants[variant],
        cardSizes[size],
        interactive && "cursor-pointer",
        hoverable && "hover:shadow-md hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
}

// Card header variants
const cardHeaderVariants = {
  default: "gap-1.5",
  spacious: "gap-3",
  compact: "gap-1",
} as const

interface CardHeaderProps extends React.ComponentProps<"div"> {
  variant?: keyof typeof cardHeaderVariants
  bordered?: boolean
  centered?: boolean
}

function CardHeader({ 
  className, 
  variant = "default", 
  bordered = false,
  centered = false,
  ...props 
}: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start",
        cardHeaderVariants[variant],
        centered && "text-center",
        bordered && "border-b pb-6",
        "px-0", // Remove default padding since it's handled by card size
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

interface CardContentProps extends React.ComponentProps<"div"> {
  padded?: boolean
  scrollable?: boolean
  maxHeight?: string
}

function CardContent({ 
  className, 
  padded = true,
  scrollable = false,
  maxHeight,
  ...props 
}: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        padded && "px-0", // Remove default padding since it's handled by card size
        scrollable && "overflow-y-auto",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
      {...props}
    />
  )
}

interface CardFooterProps extends React.ComponentProps<"div"> {
  bordered?: boolean
  centered?: boolean
  justify?: 'start' | 'center' | 'end' | 'between'
}

function CardFooter({ 
  className, 
  bordered = false,
  centered = false,
  justify = 'start',
  ...props 
}: CardFooterProps) {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  }

  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        justifyClasses[justify],
        centered && "text-center",
        bordered && "border-t pt-6",
        "px-0", // Remove default padding since it's handled by card size
        className
      )}
      {...props}
    />
  )
}

// Additional card components for visual grouping
interface CardGroupProps extends React.ComponentProps<"div"> {
  gap?: 'sm' | 'md' | 'lg'
  columns?: 1 | 2 | 3 | 4
  responsive?: boolean
}

function CardGroup({ 
  className, 
  gap = 'md', 
  columns = 1,
  responsive = true,
  ...props 
}: CardGroupProps) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8",
  }

  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }

  return (
    <div
      className={cn(
        "grid",
        gapClasses[gap],
        responsive ? columnClasses[columns] : `grid-cols-${columns}`,
        className
      )}
      {...props}
    />
  )
}

// Card section for grouping related content
interface CardSectionProps extends React.ComponentProps<"div"> {
  title?: string
  description?: string
  bordered?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
}

function CardSection({ 
  className, 
  title, 
  description, 
  bordered = false,
  collapsible = false,
  defaultCollapsed = false,
  children,
  ...props 
}: CardSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <div
      className={cn(
        "space-y-4",
        bordered && "border-l-4 border-l-primary/20 pl-4",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-1">
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
      {collapsible ? (
        <div className={cn("transition-all duration-200", isCollapsed && "hidden")}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardGroup,
  CardSection,
}
