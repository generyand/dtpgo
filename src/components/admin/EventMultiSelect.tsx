'use client'

import React, { useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMultiSelect } from '@/lib/hooks/useMultiSelect'

export interface EventItem {
  id: string
  name: string
}

export interface EventMultiSelectProps {
  events: EventItem[]
  onChange?: (selectedIds: string[]) => void
}

export function EventMultiSelect({ events, onChange }: EventMultiSelectProps) {
  const ids = useMemo(() => events.map(e => e.id), [events])
  const { selectedIds, toggle, selectAll, clear, isAllSelected, count } = useMultiSelect<string>()

  const allSelected = isAllSelected(ids)

  React.useEffect(() => {
    onChange?.(Array.from(selectedIds))
  }, [onChange, selectedIds])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox id="select-all" checked={allSelected} onCheckedChange={() => (allSelected ? clear() : selectAll(ids))} />
          <label htmlFor="select-all" className="text-sm">Select all</label>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{count} selected</Badge>
          {count > 0 && (
            <Button size="sm" variant="outline" onClick={clear}>Clear</Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {events.map((e) => {
          const checked = selectedIds.has(e.id)
          return (
            <div key={e.id} className="flex items-center gap-3">
              <Checkbox id={`event-${e.id}`} checked={checked} onCheckedChange={() => toggle(e.id)} />
              <label htmlFor={`event-${e.id}`} className="text-sm">
                {e.name}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EventMultiSelect


