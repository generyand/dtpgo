/**
 * Keyboard shortcuts manager
 * - Register global or scoped shortcuts using human-readable combos (e.g., "Ctrl+N", "Ctrl+S", "Escape").
 * - Handles meta keys across platforms (Ctrl on Windows/Linux, Cmd on macOS) via the "Mod" alias.
 */

export type KeyCombo = string // e.g., "Ctrl+N", "Mod+S", "Shift+Escape"

export interface ShortcutOptions {
  combo: KeyCombo
  handler: (event: KeyboardEvent) => void
  /** When true, calls event.preventDefault() if combo matches (default true) */
  preventDefault?: boolean
  /** Optional scope name to enable/disable groups of shortcuts */
  scope?: string
  /** Optional predicate to enable dynamically */
  when?: () => boolean
}

interface RegisteredShortcut extends ShortcutOptions {
  id: number
  normalized: string
}

let idCounter = 0

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

function normalizeCombo(combo: KeyCombo): string {
  // Support "Mod" alias → Cmd on macOS, Ctrl elsewhere
  const replaced = combo
    .replace(/\bMod\b/gi, isMac ? 'Meta' : 'Ctrl')
    .replace(/\s+/g, '')

  const parts = replaced.split('+').map(p => p.toLowerCase())
  const keys = new Set(parts)

  const order: string[] = []
  if (keys.delete('ctrl')) order.push('ctrl')
  if (keys.delete('meta')) order.push('meta')
  if (keys.delete('alt')) order.push('alt')
  if (keys.delete('shift')) order.push('shift')
  // Remaining is the main key
  const main = Array.from(keys).join('')
  if (main) order.push(main)
  return order.join('+')
}

function eventToNormalizedCombo(event: KeyboardEvent): string {
  const parts: string[] = []
  if (event.ctrlKey) parts.push('ctrl')
  if (event.metaKey) parts.push('meta')
  if (event.altKey) parts.push('alt')
  if (event.shiftKey) parts.push('shift')

  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase()
  // Map common names
  const map: Record<string, string> = {
    ' ': ' ',
    'escape': 'escape',
    'esc': 'escape',
    'enter': 'enter',
    'return': 'enter',
    'delete': 'delete',
    'backspace': 'backspace',
    'arrowup': 'arrowup',
    'arrowdown': 'arrowdown',
    'arrowleft': 'arrowleft',
    'arrowright': 'arrowright',
  }
  const main = map[key] ?? key
  parts.push(main)
  return parts.join('+')
}

class ShortcutManager {
  private shortcuts: RegisteredShortcut[] = []
  private enabledScopes: Set<string> = new Set()
  private attached = false

  enableScope(scope: string) {
    this.enabledScopes.add(scope)
  }
  disableScope(scope: string) {
    this.enabledScopes.delete(scope)
  }

  register(options: ShortcutOptions): () => void {
    const normalized = normalizeCombo(options.combo)
    const record: RegisteredShortcut = {
      id: ++idCounter,
      normalized,
      preventDefault: options.preventDefault ?? true,
      scope: options.scope,
      handler: options.handler,
      when: options.when,
      combo: options.combo,
    }
    this.shortcuts.push(record)
    this.ensureAttached()
    return () => this.unregister(record.id)
  }

  unregister(id: number) {
    this.shortcuts = this.shortcuts.filter(s => s.id !== id)
    if (this.shortcuts.length === 0) this.detach()
  }

  private ensureAttached() {
    if (this.attached) return
    if (typeof window === 'undefined') return
    window.addEventListener('keydown', this.onKeyDown, { capture: true })
    this.attached = true
  }

  private detach() {
    if (!this.attached) return
    if (typeof window === 'undefined') return
    window.removeEventListener('keydown', this.onKeyDown, { capture: true } as any)
    this.attached = false
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return
    const combo = eventToNormalizedCombo(event)
    for (const s of this.shortcuts) {
      if (s.normalized !== combo) continue
      if (s.scope && !this.enabledScopes.has(s.scope)) continue
      if (s.when && !s.when()) continue
      if (s.preventDefault) event.preventDefault()
      s.handler(event)
      break
    }
  }
}

export const keyboardShortcuts = new ShortcutManager()

export function describeCombo(combo: KeyCombo): string {
  return combo.replace(/\bMod\b/g, isMac ? '⌘' : 'Ctrl')
}


