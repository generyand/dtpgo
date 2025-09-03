import { useCallback, useMemo, useState } from 'react'

export interface MultiSelectApi<TId extends string | number = string> {
  selectedIds: Set<TId>
  isSelected: (id: TId) => boolean
  toggle: (id: TId) => void
  select: (id: TId) => void
  deselect: (id: TId) => void
  clear: () => void
  selectMany: (ids: TId[]) => void
  selectAll: (ids: TId[]) => void
  isAllSelected: (ids: TId[]) => boolean
  count: number
}

export function useMultiSelect<TId extends string | number = string>(
  initialSelected?: TId[]
): MultiSelectApi<TId> {
  const [selectedIds, setSelectedIds] = useState<Set<TId>>(
    () => new Set(initialSelected ?? [])
  )

  const isSelected = useCallback((id: TId) => selectedIds.has(id), [selectedIds])

  const toggle = useCallback((id: TId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const select = useCallback((id: TId) => {
    setSelectedIds(prev => new Set(prev).add(id))
  }, [])

  const deselect = useCallback((id: TId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const clear = useCallback(() => setSelectedIds(new Set()), [])

  const selectMany = useCallback((ids: TId[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }, [])

  const selectAll = useCallback((ids: TId[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const isAllSelected = useCallback(
    (ids: TId[]) => ids.length > 0 && ids.every(id => selectedIds.has(id)),
    [selectedIds]
  )

  const count = useMemo(() => selectedIds.size, [selectedIds])

  return {
    selectedIds,
    isSelected,
    toggle,
    select,
    deselect,
    clear,
    selectMany,
    selectAll,
    isAllSelected,
    count,
  }
}

export default useMultiSelect


