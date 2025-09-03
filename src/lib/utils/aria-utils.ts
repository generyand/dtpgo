/**
 * ARIA and screen reader utilities
 */

export function ariaBool(value: boolean | undefined): 'true' | 'false' | undefined {
  if (value === undefined) return undefined
  return value ? 'true' : 'false'
}

export function ariaProps(options: {
  label?: string
  describedById?: string
  controlsId?: string
  expanded?: boolean
  selected?: boolean
  pressed?: boolean
} = {}) {
  return {
    'aria-label': options.label,
    'aria-describedby': options.describedById,
    'aria-controls': options.controlsId,
    'aria-expanded': ariaBool(options.expanded),
    'aria-selected': ariaBool(options.selected),
    'aria-pressed': ariaBool(options.pressed),
  }
}

export function srOnly(text: string) {
  return (
    `<span class="sr-only">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
  )
}


