'use client'

import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useMultiSelect } from '@/lib/hooks/useMultiSelect'

export interface OrganizerItem {
  id: string
  name: string
  email?: string
}

export interface BulkOrganizerAssignmentProps {
  selectedEventIds: string[]
  organizers: OrganizerItem[]
  onAssign?: (params: { eventIds: string[]; organizerIds: string[] }) => Promise<void> | void
  onRemove?: (params: { eventIds: string[]; organizerIds: string[] }) => Promise<void> | void
  isLoading?: boolean
  className?: string
}

export function BulkOrganizerAssignment({
  selectedEventIds,
  organizers,
  onAssign,
  onRemove,
  isLoading = false,
  className,
}: BulkOrganizerAssignmentProps) {
  const organizerIds = useMemo(() => organizers.map(o => o.id), [organizers])
  const { selectedIds, toggle, selectAll, clear, isAllSelected, count } = useMultiSelect<string>()

  const allSelected = isAllSelected(organizerIds)
  const hasEvents = selectedEventIds.length > 0
  const disabled = !hasEvents || count === 0 || isLoading

  async function handleAssign() {
    if (disabled) return
    const ok = typeof window !== 'undefined' ? window.confirm(`Assign ${count} organizer(s) to ${selectedEventIds.length} event(s)?`) : true
    if (!ok) return
    await onAssign?.({ eventIds: selectedEventIds, organizerIds: Array.from(selectedIds) })
    clear()
  }

  async function handleRemove() {
    if (disabled) return
    const ok = typeof window !== 'undefined' ? window.confirm(`Remove ${count} organizer(s) from ${selectedEventIds.length} event(s)?`) : true
    if (!ok) return
    await onRemove?.({ eventIds: selectedEventIds, organizerIds: Array.from(selectedIds) })
    clear()
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Checkbox id="org-select-all" checked={allSelected} onCheckedChange={() => (allSelected ? clear() : selectAll(organizerIds))} />
          <label htmlFor="org-select-all" className="text-sm">Select all organizers</label>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{count} selected</Badge>
          {count > 0 && (
            <Button size="sm" variant="outline" onClick={clear} disabled={isLoading}>Clear</Button>
          )}
        </div>
      </div>

      <div className="max-h-64 overflow-auto pr-1 space-y-2">
        {organizers.map((o) => {
          const checked = selectedIds.has(o.id)
          return (
            <div key={o.id} className="flex items-center gap-3">
              <Checkbox id={`org-${o.id}`} checked={checked} onCheckedChange={() => toggle(o.id)} />
              <label htmlFor={`org-${o.id}`} className="text-sm">
                <span className="font-medium">{o.name}</span>
                {o.email && <span className="text-muted-foreground ml-2">{o.email}</span>}
              </label>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {hasEvents ? `${selectedEventIds.length} event(s) selected` : 'Select events to enable actions'}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleRemove} disabled={disabled} isLoading={isLoading}>Remove</Button>
          <Button onClick={handleAssign} disabled={disabled} isLoading={isLoading}>Assign</Button>
        </div>
      </div>
    </div>
  )
}

export default BulkOrganizerAssignment


