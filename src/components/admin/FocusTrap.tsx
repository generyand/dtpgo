'use client'

import React, { useEffect, useRef } from 'react'
import { useFocusManagement } from '@/lib/hooks/useFocusManagement'

export interface FocusTrapProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  restoreFocus?: boolean
  initialFocusRef?: React.RefObject<HTMLElement>
  onEscape?: () => void
}

export function FocusTrap({
  active = true,
  restoreFocus = true,
  initialFocusRef,
  onEscape,
  children,
  ...props
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setTrapEnabled } = useFocusManagement(containerRef, {
    initialFocusRef,
    restoreFocus,
    trapFocus: active,
  })

  useEffect(() => {
    setTrapEnabled(Boolean(active))
  }, [active, setTrapEnabled])

  useEffect(() => {
    if (!onEscape) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape()
      }
    }
    const node = containerRef.current
    node?.addEventListener('keydown', onKeyDown)
    return () => node?.removeEventListener('keydown', onKeyDown)
  }, [onEscape])

  return (
    <div ref={containerRef} {...props}>
      {children}
    </div>
  )
}

export default FocusTrap


