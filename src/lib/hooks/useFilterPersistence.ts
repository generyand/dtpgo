import { useCallback, useEffect } from 'react'
import { readStateFromSearchParams, writeStateToSearchParams, UrlStateOptions } from '@/lib/utils/url-state'

export function useFilterPersistence<TState extends Record<string, any>>(
  keys: Array<keyof TState & string>,
  state: TState,
  setState: (next: Partial<TState>) => void,
  options?: UrlStateOptions
) {
  // On mount: hydrate from URL
  useEffect(() => {
    const fromUrl = readStateFromSearchParams<TState>(keys, options)
    if (Object.keys(fromUrl).length > 0) {
      setState(fromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Whenever state changes: push to URL (replaceState to avoid history spam)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = writeStateToSearchParams(state, options)
    const next = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', next)
  }, [state, options])

  const applyFromUrl = useCallback(() => {
    const fromUrl = readStateFromSearchParams<TState>(keys, options)
    if (Object.keys(fromUrl).length > 0) setState(fromUrl)
  }, [keys, options, setState])

  return { applyFromUrl }
}

export default useFilterPersistence


