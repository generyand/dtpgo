import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { getStatusColor } from "@/lib/styles/status-colors"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Event status variants
        eventDraft: "border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        eventPublished: "border-success-300 bg-success-100 text-success-800 hover:bg-success-200",
        eventActive: "border-primary-300 bg-primary-100 text-primary-800 hover:bg-primary-200",
        eventCompleted: "border-secondary-300 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
        eventCancelled: "border-error-300 bg-error-100 text-error-800 hover:bg-error-200",
        
        // Session status variants
        sessionUpcoming: "border-warning-300 bg-warning-100 text-warning-800 hover:bg-warning-200",
        sessionOngoing: "border-success-300 bg-success-100 text-success-800 hover:bg-success-200",
        sessionCompleted: "border-secondary-300 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
        sessionCancelled: "border-error-300 bg-error-100 text-error-800 hover:bg-error-200",
        
        // User status variants
        userActive: "border-success-300 bg-success-100 text-success-800 hover:bg-success-200",
        userInactive: "border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        userSuspended: "border-error-300 bg-error-100 text-error-800 hover:bg-error-200",
        userPending: "border-warning-300 bg-warning-100 text-warning-800 hover:bg-warning-200",
        
        // Attendance status variants
        attendancePresent: "border-success-300 bg-success-100 text-success-800 hover:bg-success-200",
        attendanceAbsent: "border-error-300 bg-error-100 text-error-800 hover:bg-error-200",
        attendanceLate: "border-warning-300 bg-warning-100 text-warning-800 hover:bg-warning-200",
        attendanceExcused: "border-secondary-300 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
        attendancePending: "border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        
        // Priority variants
        priorityLow: "border-success-300 bg-success-100 text-success-800 hover:bg-success-200",
        priorityMedium: "border-warning-300 bg-warning-100 text-warning-800 hover:bg-warning-200",
        priorityHigh: "border-error-300 bg-error-100 text-error-800 hover:bg-error-200",
        priorityCritical: "border-error-400 bg-error-200 text-error-900 hover:bg-error-300",
        
        // System status variants
        systemOnline: "border-success-300 bg-success-100 text-success-800 hover:bg-success-200",
        systemOffline: "border-error-300 bg-error-100 text-error-800 hover:bg-error-200",
        systemMaintenance: "border-warning-300 bg-warning-100 text-warning-800 hover:bg-warning-200",
        systemDegraded: "border-secondary-300 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// StatusBadge component for automatic status-based styling
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  category?: 'event' | 'session' | 'user' | 'attendance' | 'priority' | 'system'
  status: string
  showIcon?: boolean
  icon?: React.ReactNode
}

function StatusBadge({ 
  className, 
  category, 
  status, 
  showIcon = false, 
  icon, 
  children,
  ...props 
}: StatusBadgeProps) {
  // Map status to variant
  const getVariant = (): string => {
    if (!category) {
      // Try to infer category from status
      if (['draft', 'published', 'active', 'completed', 'cancelled'].includes(status)) {
        return `event${status.charAt(0).toUpperCase() + status.slice(1)}` as any;
      }
      if (['upcoming', 'ongoing', 'completed', 'cancelled'].includes(status)) {
        return `session${status.charAt(0).toUpperCase() + status.slice(1)}` as any;
      }
      if (['active', 'inactive', 'suspended', 'pending'].includes(status)) {
        return `user${status.charAt(0).toUpperCase() + status.slice(1)}` as any;
      }
      if (['present', 'absent', 'late', 'excused', 'pending'].includes(status)) {
        return `attendance${status.charAt(0).toUpperCase() + status.slice(1)}` as any;
      }
      if (['low', 'medium', 'high', 'critical'].includes(status)) {
        return `priority${status.charAt(0).toUpperCase() + status.slice(1)}` as any;
      }
      if (['online', 'offline', 'maintenance', 'degraded'].includes(status)) {
        return `system${status.charAt(0).toUpperCase() + status.slice(1)}` as any;
      }
    } else {
      // Use explicit category mapping
      const variantKey = `${category}${status.charAt(0).toUpperCase() + status.slice(1)}` as any;
      if (variantKey in badgeVariants.variants.variant) {
        return variantKey;
      }
    }
    
    return 'secondary'; // Fallback
  };

  const variant = getVariant();

  return (
    <Badge 
      variant={variant as any} 
      className={cn("gap-1", className)} 
      {...props}
    >
      {showIcon && icon && icon}
      {children || status}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants }
