/**
 * High contrast mode CSS helper (class-based toggle)
 * Usage: add `high-contrast` on html/body and define overrides.
 */

export const highContrastClass = 'high-contrast'

export const highContrastStyles = `
.${highContrastClass} {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 0%);
  --muted: hsl(0 0% 90%);
  --muted-foreground: hsl(0 0% 15%);
  --border: hsl(0 0% 20%);
  --ring: hsl(210 100% 40%);
}
.${highContrastClass} .text-muted-foreground { color: var(--muted-foreground) !important; }
.${highContrastClass} .bg-muted { background-color: var(--muted) !important; }
.${highContrastClass} .border { border-color: var(--border) !important; }
.${highContrastClass} :focus-visible { outline: 3px solid var(--ring) !important; outline-offset: 2px; }
`

export function enableHighContrast() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.add(highContrastClass)
}

export function disableHighContrast() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove(highContrastClass)
}

export function isHighContrastEnabled(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains(highContrastClass)
}


