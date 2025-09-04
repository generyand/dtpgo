import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

export interface UseVirtualizationOptions {
  itemCount: number
  itemHeight: number // fixed row height in px
  overscan?: number // number of extra items above and below
}

export interface VirtualizationResult {
  containerRef: React.RefObject<HTMLDivElement>
  totalHeight: number
  startIndex: number
  endIndex: number
  offsetTop: number
}

export function useVirtualization({ itemCount, itemHeight, overscan = 6 }: UseVirtualizationOptions): VirtualizationResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportHeight, setViewportHeight] = useState<number>(0)
  const [scrollTop, setScrollTop] = useState<number>(0)

  const onScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setScrollTop(el.scrollTop)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setViewportHeight(el.clientHeight)
    setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    const resizeObserver = new ResizeObserver(() => {
      setViewportHeight(el.clientHeight)
    })
    resizeObserver.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      resizeObserver.disconnect()
    }
  }, [onScroll])

  const totalHeight = itemCount * itemHeight
  const visibleCount = Math.max(1, Math.ceil(viewportHeight / itemHeight))
  const rawStartIndex = Math.floor(scrollTop / itemHeight) - overscan
  const startIndex = Math.max(0, rawStartIndex)
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + overscan * 2)
  const offsetTop = startIndex * itemHeight

  return useMemo(
    () => ({ containerRef: containerRef as React.RefObject<HTMLDivElement>, totalHeight, startIndex, endIndex, offsetTop }),
    [endIndex, offsetTop, startIndex, totalHeight]
  )
}

export default useVirtualization


