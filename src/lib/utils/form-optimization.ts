/**
 * Form optimization helpers: shallow compare, stable refs, and deferred validation
 */

export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  if (a === b) return true
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false
  }
  return true
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>
  for (const k of keys) (out as Record<string, unknown>)[k as string] = obj[k]
  return out
}

export function debounce<F extends (...args: unknown[]) => void>(fn: F, delayMs: number) {
  let t: NodeJS.Timeout | undefined
  return (...args: Parameters<F>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delayMs)
  }
}

export function memoizeOne<F extends (...args: unknown[]) => unknown>(fn: F): F {
  let lastArgs: unknown[] | undefined
  let lastResult: unknown
  return ((...args: unknown[]) => {
    if (lastArgs && args.length === lastArgs.length && args.every((v, i) => v === lastArgs![i])) {
      return lastResult
    }
    lastArgs = args
    lastResult = fn(...args)
    return lastResult
  }) as F
}


