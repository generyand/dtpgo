import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface KeyboardNavigationOptions {
  orientation?: 'vertical' | 'horizontal' | 'grid'
  loop?: boolean
  itemSelector?: string
  activateKeys?: Array<'Enter' | ' '>
  container?: HTMLElement | null
}

export interface KeyboardNavigationApi<TElement extends HTMLElement = HTMLElement> {
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  onKeyDown: (event: React.KeyboardEvent<TElement>) => void
  getItemProps: (index: number) => {
    tabIndex: number
    'data-kb-index': number
    onFocus: () => void
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function useKeyboardNavigation<TElement extends HTMLElement = HTMLElement>(
  itemCount: number,
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationApi<TElement> {
  const {
    orientation = 'vertical',
    loop = true,
    itemSelector = '[data-kb-index]',
    activateKeys = ['Enter', ' '],
    container,
  } = options

  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const lastIndexRef = useRef<number>(0)

  // Keep focusedIndex in range when itemCount changes
  useEffect(() => {
    setFocusedIndex((prev) => clamp(prev, 0, Math.max(0, itemCount - 1)))
  }, [itemCount])

  const moveFocus = useCallback(
    (nextIndex: number) => {
      if (itemCount === 0) return
      const max = itemCount - 1
      let target = nextIndex

      if (loop) {
        if (target < 0) target = max
        if (target > max) target = 0
      } else {
        target = clamp(target, 0, max)
      }

      setFocusedIndex(target)

      // Try to focus the corresponding element if available
      const root: HTMLElement | Document = container ?? document
      const el = root.querySelector<HTMLElement>(`${itemSelector}[data-kb-index="${target}"]`)
      el?.focus()
    },
    [container, itemCount, itemSelector, loop]
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<TElement>) => {
      if (itemCount === 0) return
      const key = event.key

      switch (key) {
        case 'ArrowDown':
        case 'j':
          if (orientation !== 'horizontal') {
            event.preventDefault()
            moveFocus(focusedIndex + 1)
          }
          break
        case 'ArrowUp':
        case 'k':
          if (orientation !== 'horizontal') {
            event.preventDefault()
            moveFocus(focusedIndex - 1)
          }
          break
        case 'ArrowRight':
          if (orientation !== 'vertical') {
            event.preventDefault()
            moveFocus(focusedIndex + 1)
          }
          break
        case 'ArrowLeft':
          if (orientation !== 'vertical') {
            event.preventDefault()
            moveFocus(focusedIndex - 1)
          }
          break
        case 'Home':
          event.preventDefault()
          moveFocus(0)
          break
        case 'End':
          event.preventDefault()
          moveFocus(itemCount - 1)
          break
        default:
          break
      }

      // Activation keys bubble to item handlers
      if (activateKeys.includes(key as 'Enter' | ' ')) {
        // Let the focused item handle the activation via onClick/onKeyDown
      }
    },
    [activateKeys, focusedIndex, itemCount, moveFocus, orientation]
  )

  useEffect(() => {
    lastIndexRef.current = focusedIndex
  }, [focusedIndex])

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      'data-kb-index': index,
      onFocus: () => setFocusedIndex(index),
    }),
    [focusedIndex]
  )

  return useMemo(
    () => ({ focusedIndex, setFocusedIndex, onKeyDown, getItemProps }),
    [focusedIndex, getItemProps, onKeyDown]
  )
}

export default useKeyboardNavigation


