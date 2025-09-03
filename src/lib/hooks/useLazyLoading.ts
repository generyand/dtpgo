import { useEffect, useRef, useState } from 'react'

export interface UseLazyLoadingOptions {
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useLazyLoading<TElement extends Element = Element>({ rootMargin = '200px', threshold = 0.1, once = true }: UseLazyLoadingOptions = {}) {
  const ref = useRef<TElement | null>(null)
  const [isInView, setIsInView] = useState<boolean>(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setIsInView(false)
          }
        })
      },
      { root: null, rootMargin, threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold, once])

  return { ref, isInView }
}

export default useLazyLoading


