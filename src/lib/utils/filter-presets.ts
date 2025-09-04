/**
 * Filter presets persisted in localStorage
 */

export interface FilterPreset<TState extends Record<string, unknown> = Record<string, unknown>> {
  id: string
  name: string
  state: TState
  updatedAt: number
}

export interface FilterPresetStoreOptions {
  namespace?: string
}

const DEFAULT_NS = 'dtp-attendance:filter-presets'

function getKey(namespace?: string) {
  return namespace ? `${DEFAULT_NS}:${namespace}` : DEFAULT_NS
}

export function listPresets<TState extends Record<string, unknown> = Record<string, unknown>>(options?: FilterPresetStoreOptions): FilterPreset<TState>[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getKey(options?.namespace))
    if (!raw) return []
    const parsed = JSON.parse(raw) as FilterPreset<TState>[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function savePresets<TState extends Record<string, unknown> = Record<string, unknown>>(presets: FilterPreset<TState>[], options?: FilterPresetStoreOptions) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getKey(options?.namespace), JSON.stringify(presets))
  } catch {
    // no-op
  }
}

export function upsertPreset<TState extends Record<string, unknown> = Record<string, unknown>>(
  preset: Omit<FilterPreset<TState>, 'id' | 'updatedAt'> & { id?: string },
  options?: FilterPresetStoreOptions
): FilterPreset<TState> {
  const presets = listPresets<TState>(options)
  const id = preset.id ?? cryptoId()
  const next: FilterPreset<TState> = { id, name: preset.name, state: preset.state, updatedAt: Date.now() }
  const existingIndex = presets.findIndex(p => p.id === id)
  if (existingIndex >= 0) presets[existingIndex] = next
  else presets.push(next)
  savePresets(presets, options)
  return next
}

export function deletePreset<TState extends Record<string, unknown> = Record<string, unknown>>(id: string, options?: FilterPresetStoreOptions) {
  const presets = listPresets<TState>(options)
  const next = presets.filter(p => p.id !== id)
  savePresets(next, options)
}

export function renamePreset<TState extends Record<string, unknown> = Record<string, unknown>>(id: string, name: string, options?: FilterPresetStoreOptions) {
  const presets = listPresets<TState>(options)
  const idx = presets.findIndex(p => p.id === id)
  if (idx >= 0) {
    presets[idx].name = name
    presets[idx].updatedAt = Date.now()
    savePresets(presets, options)
  }
}

export function getPreset<TState extends Record<string, unknown> = Record<string, unknown>>(id: string, options?: FilterPresetStoreOptions): FilterPreset<TState> | undefined {
  return listPresets<TState>(options).find(p => p.id === id)
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as { randomUUID: () => string }).randomUUID()
  return Math.random().toString(36).slice(2)
}


