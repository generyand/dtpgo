/**
 * URL state helpers: serialize/deserialize simple filter state to query params
 */

export type Primitive = string | number | boolean | null | undefined
export type Serializable = Primitive | Primitive[] | Record<string, unknown>

export interface UrlStateOptions {
  /** Query param key prefix to avoid collisions, e.g., 'events' → events_q, events_s[] */
  prefix?: string
}

function withPrefix(key: string, prefix?: string) {
  return prefix ? `${prefix}_${key}` : key
}

export function writeStateToSearchParams(
  state: Record<string, unknown>,
  options?: UrlStateOptions,
  base?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(base ?? (typeof window !== 'undefined' ? window.location.search : ''))
  const prefix = options?.prefix

  Object.entries(state).forEach(([key, value]) => {
    const pKey = withPrefix(key, prefix)
    params.delete(pKey)

    if (value == null || value === '') return

    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null && `${v}` !== '') params.append(pKey, `${v}`)
      })
    } else if (value instanceof Date) {
      params.set(pKey, value.toISOString())
    } else if (typeof value === 'object' && 'from' in value || 'to' in value) {
      // Date range object
      const from = value.from ? new Date(value.from).toISOString() : ''
      const to = value.to ? new Date(value.to).toISOString() : ''
      if (from) params.set(`${pKey}_from`, from)
      if (to) params.set(`${pKey}_to`, to)
    } else {
      params.set(pKey, `${value}`)
    }
  })

  return params
}

export function readStateFromSearchParams<TState extends Record<string, unknown> = Record<string, unknown>>(
  keys: Array<keyof TState & string>,
  options?: UrlStateOptions,
  searchParams?: URLSearchParams
): Partial<TState> {
  const params = searchParams ?? (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams())
  const prefix = options?.prefix
  const result: Record<string, unknown> = {}

  for (const key of keys) {
    const pKey = withPrefix(key, prefix)
    const hasRange = params.has(`${pKey}_from`) || params.has(`${pKey}_to`)
    if (hasRange) {
      const fromStr = params.get(`${pKey}_from`)
      const toStr = params.get(`${pKey}_to`)
      result[key] = {
        from: fromStr ? new Date(fromStr) : null,
        to: toStr ? new Date(toStr) : null,
      }
      continue
    }

    const all = params.getAll(pKey)
    if (all.length > 1) {
      result[key] = all
    } else {
      const single = params.get(pKey)
      if (single != null) result[key] = single
    }
  }

  return result as Partial<TState>
}


