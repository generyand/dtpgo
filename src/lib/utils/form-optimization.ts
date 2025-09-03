/**
 * Form optimization helpers: shallow compare, stable refs, and deferred validation
 */

export function shallowEqual<T extends Record<string, any>>(a: T, b: T): boolean {
  if (a === b) return true
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false
  }
  return true
}

export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>
  for (const k of keys) (out as any)[k] = obj[k]
  return out
}

export function debounce<F extends (...args: any[]) => void>(fn: F, delayMs: number) {
  let t: any
  return (...args: Parameters<F>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delayMs)
  }
}

export function memoizeOne<F extends (...args: any[]) => any>(fn: F): F {
  let lastArgs: any[] | undefined
  let lastResult: any
  return ((...args: any[]) => {
    if (lastArgs && args.length === lastArgs.length && args.every((v, i) => v === lastArgs![i])) {
      return lastResult
    }
    lastArgs = args
    lastResult = fn(...args)
    return lastResult
  }) as F
}


