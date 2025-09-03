'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Inbox, Search, Plus, RefreshCw } from 'lucide-react'

type Preset = 'default' | 'search' | 'inbox' | 'custom'

export interface EmptyStateAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: React.ComponentProps<typeof Button>['variant']
  icon?: React.ReactNode
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  preset?: Preset
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  inline?: boolean
  compact?: boolean
}

const presetIcon: Record<Preset, React.ReactNode> = {
  default: <Inbox className="size-10 text-muted-foreground" aria-hidden="true" />,
  search: <Search className="size-10 text-muted-foreground" aria-hidden="true" />,
  inbox: <Inbox className="size-10 text-muted-foreground" aria-hidden="true" />,
  custom: null,
}

export function EmptyState({
  className,
  title = 'Nothing here yet',
  description = 'When there is content to show, it will appear here.',
  icon,
  preset = 'default',
  primaryAction,
  secondaryAction,
  inline = false,
  compact = false,
  ...props
}: EmptyStateProps) {
  const Content = (
    <div className={cn('flex w-full flex-col items-center text-center', compact ? 'gap-2' : 'gap-3')}> 
      <div className={cn('grid place-items-center rounded-full border bg-muted/40', compact ? 'size-14' : 'size-20')}> 
        {icon ?? presetIcon[preset]}
      </div>
      <div className="space-y-1">
        <h3 className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>{title}</h3>
        {description && (
          <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>{description}</p>
        )}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="mt-1 flex items-center gap-2">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              variant={primaryAction.variant ?? 'default'}
              asChild={!!primaryAction.href}
            >
              {primaryAction.href ? (
                <a href={primaryAction.href}>
                  {primaryAction.icon ?? <Plus className="size-4" />} {primaryAction.label}
                </a>
              ) : (
                <>
                  {primaryAction.icon ?? <Plus className="size-4" />} {primaryAction.label}
                </>
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant ?? 'outline'}
              asChild={!!secondaryAction.href}
            >
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>
                  {secondaryAction.icon ?? <RefreshCw className="size-4" />} {secondaryAction.label}
                </a>
              ) : (
                <>
                  {secondaryAction.icon ?? <RefreshCw className="size-4" />} {secondaryAction.label}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  if (inline) {
    return (
      <div className={cn('w-full py-10', className)} {...props}>
        {Content}
      </div>
    )
  }

  return (
    <Card className={cn('w-full', className)} {...props}>
      <CardHeader className="items-center">
        <CardTitle className="sr-only">Empty</CardTitle>
        <CardDescription className="sr-only">No content</CardDescription>
      </CardHeader>
      <CardContent className={cn('grid place-items-center py-10', compact ? 'py-6' : 'py-10')}>
        {Content}
      </CardContent>
    </Card>
  )
}

export function InlineEmptyState(props: EmptyStateProps) {
  return <EmptyState inline {...props} />
}


