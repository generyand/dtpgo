'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ShortcutItem {
  keys: string
  action: string
}

const defaultShortcuts: ShortcutItem[] = [
  { keys: 'Arrow Up / k', action: 'Move selection up' },
  { keys: 'Arrow Down / j', action: 'Move selection down' },
  { keys: 'Home', action: 'Jump to first item' },
  { keys: 'End', action: 'Jump to last item' },
  { keys: 'Enter / Space', action: 'Activate selected item' },
  { keys: 'Esc', action: 'Close or cancel' },
]

export interface KeyboardShortcutsProps {
  title?: string
  shortcuts?: ShortcutItem[]
  className?: string
}

export function KeyboardShortcuts({ title = 'Keyboard Shortcuts', shortcuts = defaultShortcuts, className }: KeyboardShortcutsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">{s.action}</div>
              <div className="font-mono text-xs bg-muted px-2 py-1 rounded-md border">{s.keys}</div>
            </div>
          ))}
          <Separator className="my-3" />
          <div className="text-xs text-muted-foreground">Tip: Use arrow keys to navigate and Enter/Space to activate items.</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default KeyboardShortcuts


