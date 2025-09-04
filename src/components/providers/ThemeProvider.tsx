'use client'

import React from 'react'
import { highContrastStyles } from '@/lib/styles/high-contrast'

export interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    // Inject high contrast CSS once
    const id = 'high-contrast-inline-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = highContrastStyles
      document.head.appendChild(style)
    }
  }, [])

  return <>{children}</>
}

export default ThemeProvider


