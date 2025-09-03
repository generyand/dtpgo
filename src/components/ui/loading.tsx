'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function Spinner({ className, size = 'md', label, ...props }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-8' : 'size-6'
  return (
    <div className={cn('inline-flex items-center gap-2', className)} {...props}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeClass)} aria-hidden="true" />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean
  label?: string
  blurBackground?: boolean
}

export function LoadingOverlay({ show, label = 'Loading…', blurBackground = true, className, children, ...props }: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      {show && (
        <div className={cn('absolute inset-0 z-10 grid place-items-center rounded-md bg-background/60', blurBackground && 'backdrop-blur-sm')}>
          <div className="flex items-center gap-3 rounded-md border bg-card px-4 py-2 shadow-sm">
            <Spinner label={label} />
          </div>
        </div>
      )}
    </div>
  )
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Skeleton({ className, rounded = 'md', ...props }: SkeletonProps) {
  const radius = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded]

  return <div className={cn('animate-pulse bg-muted', radius, className)} {...props} />
}


