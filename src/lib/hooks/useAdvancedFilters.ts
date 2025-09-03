import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

export type DateRange = { from?: Date | null; to?: Date | null }

export interface AdvancedFiltersState<TStatus extends string = string> {
  query: string
  statuses: TStatus[]
  dateRange: DateRange
}

export interface AdvancedFiltersApi<TStatus extends string = string> {
  state: AdvancedFiltersState<TStatus>
  debouncedQuery: string
  setQuery: (q: string) => void
  toggleStatus: (s: TStatus) => void
  setStatuses: (s: TStatus[]) => void
  setDateRange: (range: DateRange) => void
  clear: () => void
  hasActiveFilters: boolean
}

export function useAdvancedFilters<TStatus extends string = string>(
  initial?: Partial<AdvancedFiltersState<TStatus>>,
  debounceMs: number = 250
): AdvancedFiltersApi<TStatus> {
  const [state, setState] = useState<AdvancedFiltersState<TStatus>>({
    query: initial?.query ?? '',
    statuses: initial?.statuses ?? [],
    dateRange: initial?.dateRange ?? { from: null, to: null },
  })

  const debouncedQuery = useDebounce(state.query, debounceMs)

  const setQuery = useCallback((q: string) => {
    setState(prev => ({ ...prev, query: q }))
  }, [])

  const toggleStatus = useCallback((s: TStatus) => {
    setState(prev => {
      const set = new Set(prev.statuses)
      if (set.has(s)) set.delete(s)
      else set.add(s)
      return { ...prev, statuses: Array.from(set) }
    })
  }, [])

  const setStatuses = useCallback((s: TStatus[]) => {
    setState(prev => ({ ...prev, statuses: s }))
  }, [])

  const setDateRange = useCallback((range: DateRange) => {
    setState(prev => ({ ...prev, dateRange: range }))
  }, [])

  const clear = useCallback(() => {
    setState({ query: '', statuses: [], dateRange: { from: null, to: null } })
  }, [])

  const hasActiveFilters = useMemo(() => {
    const { query, statuses, dateRange } = state
    return (
      (query?.trim()?.length ?? 0) > 0 ||
      (statuses?.length ?? 0) > 0 ||
      Boolean(dateRange?.from) ||
      Boolean(dateRange?.to)
    )
  }, [state])

  return {
    state,
    debouncedQuery,
    setQuery,
    toggleStatus,
    setStatuses,
    setDateRange,
    clear,
    hasActiveFilters,
  }
}

export default useAdvancedFilters


