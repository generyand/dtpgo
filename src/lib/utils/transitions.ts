/**
 * Transition helpers for consistent micro-interactions
 */

import { durations, easings } from '@/lib/styles/animations'

export function transition(
  properties: string | string[] = 'all',
  duration: keyof typeof durations = 'normal',
  easing: keyof typeof easings = 'out'
) {
  const props = Array.isArray(properties) ? properties.join(', ') : properties
  return {
    transitionProperty: props,
    transitionDuration: `${durations[duration]}ms`,
    transitionTimingFunction: easings[easing],
  } as const
}

export function hoverScale(scale: number = 1.01) {
  return {
    transform: `scale(1)`,
    ':hover': {
      transform: `scale(${scale})`,
    },
  }
}

export const transitions = {
  default: transition('all', 'normal', 'out'),
  color: transition(['color', 'background-color', 'border-color'], 'fast', 'out'),
  transform: transition('transform', 'fast', 'out'),
}


