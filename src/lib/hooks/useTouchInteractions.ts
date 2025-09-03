import { useEffect, useRef, useState } from 'react'

export interface UseTouchInteractionsOptions {
  swipeThreshold?: number
}

export function useTouchInteractions({ swipeThreshold = 40 }: UseTouchInteractionsOptions = {}) {
  const startX = useRef(0)
  const startY = useRef(0)
  const [swipe, setSwipe] = useState<'left' | 'right' | 'up' | 'down' | null>(null)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0]
      startX.current = t.clientX
      startY.current = t.clientY
      setSwipe(null)
    }
    function onTouchEnd(e: TouchEvent) {
      const t = e.changedTouches[0]
      const dx = t.clientX - startX.current
      const dy = t.clientY - startY.current
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > swipeThreshold) setSwipe(dx > 0 ? 'right' : 'left')
      } else {
        if (Math.abs(dy) > swipeThreshold) setSwipe(dy > 0 ? 'down' : 'up')
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart as any)
      window.removeEventListener('touchend', onTouchEnd as any)
    }
  }, [swipeThreshold])

  return { swipe }
}

export default useTouchInteractions


