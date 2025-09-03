'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FilterPreset, listPresets, upsertPreset, deletePreset } from '@/lib/utils/filter-presets'

export interface FilterPresetsProps<TState extends Record<string, any> = Record<string, any>> {
  namespace?: string
  currentState: TState
  onApply: (state: TState) => void
}

export function FilterPresets<TState extends Record<string, any>>({ namespace, currentState, onApply }: FilterPresetsProps<TState>) {
  const [presets, setPresets] = React.useState<FilterPreset<TState>[]>([])
  const [name, setName] = React.useState('')

  const refresh = React.useCallback(() => {
    setPresets(listPresets<TState>({ namespace }))
  }, [namespace])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  function handleSave() {
    if (!name.trim()) return
    upsertPreset<TState>({ name: name.trim(), state: currentState }, { namespace })
    setName('')
    refresh()
  }

  function handleApply(preset: FilterPreset<TState>) {
    onApply(preset.state)
  }

  function handleDelete(id: string) {
    deletePreset<TState>(id, { namespace })
    refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input placeholder="Preset name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={handleSave} disabled={!name.trim()}>Save Preset</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.length === 0 ? (
          <span className="text-xs text-muted-foreground">No presets saved.</span>
        ) : (
          presets
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <Badge className="cursor-pointer" onClick={() => handleApply(p)}>{p.name}</Badge>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>Delete</Button>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default FilterPresets


