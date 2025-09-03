'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAdvancedFilters } from '@/lib/hooks/useAdvancedFilters'

export interface AdvancedFiltersProps<TStatus extends string = string> {
  statuses: TStatus[]
  statusLabels?: Record<TStatus, string>
  onChange?: (filters: ReturnType<typeof useAdvancedFilters<TStatus>>['state']) => void
}

export function AdvancedFilters<TStatus extends string = string>({ statuses, statusLabels, onChange }: AdvancedFiltersProps<TStatus>) {
  const filters = useAdvancedFilters<TStatus>()

  React.useEffect(() => {
    onChange?.(filters.state)
  }, [filters.state, onChange])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name, organizer, etc."
          value={filters.state.query}
          onChange={(e) => filters.setQuery(e.target.value)}
        />
        {filters.hasActiveFilters && (
          <Button variant="outline" onClick={filters.clear}>
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((s) => {
          const active = filters.state.statuses.includes(s)
          return (
            <Badge
              key={s}
              variant={active ? 'default' : 'secondary'}
              className="cursor-pointer select-none"
              onClick={() => filters.toggleStatus(s)}
            >
              {statusLabels?.[s] ?? s}
            </Badge>
          )
        })}
      </div>

      {/* Placeholder for a future date range picker */}
      <div className="text-xs text-muted-foreground">
        Tip: Add a date range picker here (from/to) when ready.
      </div>
    </div>
  )
}

export default AdvancedFilters


