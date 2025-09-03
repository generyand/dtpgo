/**
 * Micro-interactions and animation utilities
 */

export const durations = {
  instant: 75,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const

export const easings = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  in: 'cubic-bezier(0.7, 0, 0.84, 0)',
  both: 'cubic-bezier(0.83, 0, 0.17, 1)',
  gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const

export const hoverEffects = {
  subtle: 'transition-transform transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-y-[-1px] hover:shadow-sm',
  lift: 'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-md',
  glow: 'transition-shadow duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_1px_8px_rgba(0,0,0,0.08)]',
  outline: 'transition-shadow duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_0_0_3px_var(--ring)/.2] focus-visible:shadow-[0_0_0_3px_var(--ring)/.4] focus-visible:outline-none',
} as const

export const pressEffects = {
  tap: 'active:translate-y-[1px] active:scale-[0.99] transition-transform duration-150',
  compress: 'active:scale-95 transition-transform duration-150',
} as const

export const focusEffects = {
  ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
  ringStrong: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
} as const

export const fadeIn = 'animate-in fade-in duration-200'
export const fadeOut = 'animate-out fade-out duration-200'
export const slideUp = 'animate-in slide-in-from-bottom-2 duration-200'
export const slideDown = 'animate-in slide-in-from-top-2 duration-200'
export const scaleIn = 'animate-in zoom-in-95 duration-200'

export function composeClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function interactive(
  options?: Partial<{ hover: keyof typeof hoverEffects; press: keyof typeof pressEffects; focus: keyof typeof focusEffects }>
): string {
  const hover = options?.hover ? hoverEffects[options.hover] : hoverEffects.subtle
  const press = options?.press ? pressEffects[options.press] : pressEffects.tap
  const focus = options?.focus ? focusEffects[options.focus] : focusEffects.ring
  return composeClasses(hover, press, focus)
}

export type DurationKey = keyof typeof durations
export type EasingKey = keyof typeof easings

