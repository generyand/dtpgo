'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type SessionStatus = 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'

export interface BulkSessionOperationsProps {
  selectedSessionIds: string[]
  isLoading?: boolean
  onDelete?: (params: { sessionIds: string[] }) => Promise<void> | void
  onEdit?: (params: { sessionIds: string[]; patch: { status?: SessionStatus; maxCapacity?: number } }) => Promise<void> | void
  onCreate?: (params: { templateSessionId?: string; count: number }) => Promise<void> | void
}

export function BulkSessionOperations({
  selectedSessionIds,
  isLoading = false,
  onDelete,
  onEdit,
  onCreate,
}: BulkSessionOperationsProps) {
  const hasSelection = selectedSessionIds.length > 0
  const [editStatus, setEditStatus] = useState<SessionStatus | ''>('')
  const [editCapacity, setEditCapacity] = useState<string>('')
  const [createCount, setCreateCount] = useState<number>(1)
  const templateSessionId = useMemo(() => selectedSessionIds[0], [selectedSessionIds])

  async function handleDelete() {
    if (!hasSelection || isLoading) return
    const ok = typeof window !== 'undefined' ? window.confirm(`Delete ${selectedSessionIds.length} session(s)? This cannot be undone.`) : true
    if (!ok) return
    await onDelete?.({ sessionIds: selectedSessionIds })
  }

  async function handleEdit() {
    if (!hasSelection || isLoading) return
    const patch: { status?: SessionStatus; maxCapacity?: number } = {}
    if (editStatus) patch.status = editStatus
    if (editCapacity) {
      const parsed = Number(editCapacity)
      if (!Number.isFinite(parsed) || parsed <= 0) return
      patch.maxCapacity = parsed
    }
    if (Object.keys(patch).length === 0) return
    const ok = typeof window !== 'undefined' ? window.confirm(`Apply changes to ${selectedSessionIds.length} session(s)?`) : true
    if (!ok) return
    await onEdit?.({ sessionIds: selectedSessionIds, patch })
  }

  async function handleCreate() {
    if (isLoading) return
    const count = Math.max(1, Math.min(50, Number(createCount) || 1))
    const ok = typeof window !== 'undefined' ? window.confirm(`Create ${count} new session(s)${templateSessionId ? ' from template' : ''}?`) : true
    if (!ok) return
    await onCreate?.({ templateSessionId, count })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {hasSelection ? (
            <>
              <Badge variant="secondary">{selectedSessionIds.length} selected</Badge>
              <span className="ml-2">Template: {templateSessionId || 'None'}</span>
            </>
          ) : (
            'Select sessions to enable edit/delete; create does not require selection.'
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" disabled={!hasSelection || isLoading} onClick={handleDelete} isLoading={isLoading}>
            Delete Selected
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <div className="font-medium mb-3">Bulk Edit</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-28 text-sm text-muted-foreground">Status</label>
              <select
                className="h-9 px-3 rounded-md border bg-background"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as SessionStatus | '')}
              >
                <option value="">No change</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 text-sm text-muted-foreground">Max capacity</label>
              <input
                type="number"
                min={1}
                className="h-9 px-3 rounded-md border bg-background w-40"
                placeholder="No change"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
              />
            </div>
            <div className="pt-1">
              <Button onClick={handleEdit} disabled={!hasSelection || isLoading || (!editStatus && !editCapacity)} isLoading={isLoading}>
                Apply to Selected
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="font-medium mb-3">Bulk Create</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-28 text-sm text-muted-foreground">Count</label>
              <input
                type="number"
                min={1}
                max={50}
                className="h-9 px-3 rounded-md border bg-background w-32"
                value={createCount}
                onChange={(e) => setCreateCount(Number(e.target.value) || 1)}
              />
            </div>
            <div className="text-xs text-muted-foreground">Optional: first selected session will be used as template if available.</div>
            <div className="pt-1">
              <Button onClick={handleCreate} disabled={isLoading} isLoading={isLoading}>
                Create Sessions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkSessionOperations


