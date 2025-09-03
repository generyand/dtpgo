/**
 * Basic WCAG 2.1 AA audit utilities
 */

export interface ContrastResult {
  ratio: number
  isAA: boolean
  isAAA: boolean
}

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '')
  const h = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return [r, g, b]
}

export function contrastRatio(fg: string, bg: string): ContrastResult | null {
  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)
  if (!fgRgb || !bgRgb) return null
  const L1 = luminance(fgRgb[0], fgRgb[1], fgRgb[2])
  const L2 = luminance(bgRgb[0], bgRgb[1], bgRgb[2])
  const light = Math.max(L1, L2)
  const dark = Math.min(L1, L2)
  const ratio = (light + 0.05) / (dark + 0.05)
  return {
    ratio,
    isAA: ratio >= 4.5,
    isAAA: ratio >= 7,
  }
}

export interface AuditIssue {
  type: 'contrast' | 'aria' | 'semantic' | 'keyboard'
  message: string
  node?: Element
}

export interface AuditReport {
  issues: AuditIssue[]
}

export async function runBasicAudit(root: HTMLElement | Document = document): Promise<AuditReport> {
  const issues: AuditIssue[] = []

  // Contrast checks for elements with inline styles (basic heuristic)
  const candidates = Array.from(root.querySelectorAll<HTMLElement>('*'))
  for (const el of candidates) {
    const style = getComputedStyle(el)
    const fg = rgbToHex(style.color)
    const bg = rgbToHex(style.backgroundColor) || rgbToHex(getComputedStyle(el.parentElement || document.body).backgroundColor)
    if (fg && bg) {
      const result = contrastRatio(fg, bg)
      if (result && !result.isAA) {
        issues.push({ type: 'contrast', message: `Low contrast (${result.ratio.toFixed(2)}:1)`, node: el })
      }
    }
  }

  // ARIA label checks for buttons/links/icons
  const actionable = root.querySelectorAll('button, [role="button"], a')
  actionable.forEach((el) => {
    const hasText = (el.textContent || '').trim().length > 0
    const hasLabel = el.getAttribute('aria-label') || el.getAttribute('title')
    const hasImgAlt = el.querySelector('img[alt]')
    if (!hasText && !hasLabel && !hasImgAlt) {
      issues.push({ type: 'aria', message: 'Actionable element lacks accessible name', node: el })
    }
  })

  // Keyboard focusable without tabindex
  const tabbables = root.querySelectorAll('[tabindex="-1"]')
  tabbables.forEach((el) => {
    issues.push({ type: 'keyboard', message: 'Element removed from tab order (tabindex="-1")', node: el })
  })

  return { issues }
}

function rgbToHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (!m) return null
  const r = Number(m[1])
  const g = Number(m[2])
  const b = Number(m[3])
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}


