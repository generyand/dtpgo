import { useCallback, useMemo, useRef } from 'react'
import { debounce, shallowEqual } from '@/lib/utils/form-optimization'

export interface OptimizedFormOptions<TValues extends Record<string, unknown>> {
  validate?: (values: TValues) => Promise<Record<string, string>> | Record<string, string>
  debounceMs?: number
}

export function useOptimizedForm<TValues extends Record<string, unknown>>(
  values: TValues,
  onChange: (next: Partial<TValues>) => void,
  { validate, debounceMs = 200 }: OptimizedFormOptions<TValues> = {}
) {
  const lastValuesRef = useRef<TValues>(values)
  const debouncedValidate = useMemo(() => (validate ? debounce(validate as (...args: unknown[]) => void, debounceMs) : undefined), [validate, debounceMs])

  const setFieldValue = useCallback(
    <K extends keyof TValues>(key: K, value: TValues[K]) => {
      const next = { ...lastValuesRef.current, [key]: value } as TValues
      if (!shallowEqual(next, lastValuesRef.current)) {
        lastValuesRef.current = next
        onChange({ [key]: value } as unknown as Partial<TValues>)
        if (debouncedValidate) debouncedValidate(next)
      }
    },
    [debouncedValidate, onChange]
  )

  return { setFieldValue }
}

export default useOptimizedForm


