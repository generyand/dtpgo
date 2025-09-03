'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { describeCombo } from '@/lib/utils/keyboard-shortcuts'

interface Shortcut {
  combo: string
  label: string
}

const defaults: Shortcut[] = [
  { combo: 'Mod+N', label: 'New event/session' },
  { combo: 'Mod+S', label: 'Save changes' },
  { combo: 'Escape', label: 'Close/cancel' },
]

export function ShortcutHelp({ title = 'Shortcuts', items = defaults, className }: { title?: string; items?: Shortcut[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{it.label}</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded-md border">
                {describeCombo(it.combo)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ShortcutHelp


