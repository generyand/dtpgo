import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type FocusableElement = HTMLElement & { disabled?: boolean }

const focusableSelectors = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function getFocusableElements(container: HTMLElement | Document): FocusableElement[] {
  const root: ParentNode = container instanceof HTMLElement ? container : document
  return Array.from(root.querySelectorAll<FocusableElement>(focusableSelectors)).filter(
    (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
  )
}

export interface UseFocusManagementOptions {
  /** If provided, this element will receive focus on mount */
  initialFocusRef?: React.RefObject<HTMLElement>
  /** Restore focus to the previously focused element on unmount (default: true) */
  restoreFocus?: boolean
  /** Enable Tab/Shift+Tab trapping within the container (default: false) */
  trapFocus?: boolean
}

export interface FocusManagementApi {
  focusFirst: () => void
  focusLast: () => void
  focusElement: (el?: HTMLElement | null) => void
  setTrapEnabled: (enabled: boolean) => void
}

export function useFocusManagement(
  containerRef: React.RefObject<HTMLElement | null>,
  { initialFocusRef, restoreFocus = true, trapFocus = false }: UseFocusManagementOptions = {}
): FocusManagementApi {
  const previousFocusedRef = useRef<Element | null>(null)
  const [trapEnabled, setTrapEnabled] = useState<boolean>(trapFocus)

  useEffect(() => {
    previousFocusedRef.current = document.activeElement

    const container = containerRef.current
    if (container) {
      const toFocus = initialFocusRef?.current || getFocusableElements(container)[0]
      if (toFocus) {
        requestAnimationFrame(() => (toFocus as HTMLElement).focus())
      }
    }

    return () => {
      if (!restoreFocus) return
      const prev = previousFocusedRef.current as HTMLElement | null
      if (prev && typeof prev.focus === 'function') {
        requestAnimationFrame(() => prev.focus())
      }
    }
  }, [containerRef, initialFocusRef, restoreFocus])

  const focusFirst = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const els = getFocusableElements(container)
    els[0]?.focus()
  }, [containerRef])

  const focusLast = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const els = getFocusableElements(container)
    els[els.length - 1]?.focus()
  }, [containerRef])

  const focusElement = useCallback((el?: HTMLElement | null) => {
    el?.focus()
  }, [])

  useEffect(() => {
    if (!trapEnabled) return
    const container = containerRef.current
    if (!container) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !container) return
      const focusables = getFocusableElements(container)
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [containerRef, trapEnabled])

  const api = useMemo<FocusManagementApi>(
    () => ({ focusFirst, focusLast, focusElement, setTrapEnabled }),
    [focusElement, focusFirst, focusLast]
  )

  return api
}

export default useFocusManagement


