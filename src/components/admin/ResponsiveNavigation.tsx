'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/lib/hooks/useNavigation'
import useResponsive from '@/lib/hooks/useResponsive'

export function ResponsiveNavigation({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const { isMobile } = useResponsive()
  const { open, setOpen } = useNavigation()

  return (
    <div className="flex w-full">
      {isMobile ? (
        <>
          <div className="fixed top-2 left-2 z-50">
            <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
              {open ? 'Close' : 'Menu'}
            </Button>
          </div>
          {open && (
            <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
              <div className="absolute inset-y-0 left-0 w-72 bg-background border-r p-3 overflow-auto">
                {sidebar}
              </div>
            </div>
          )}
          <div className="flex-1">{children}</div>
        </>
      ) : (
        <>
          <div className="w-72 shrink-0 border-r p-3 overflow-auto">{sidebar}</div>
          <div className="flex-1">{children}</div>
        </>
      )}
    </div>
  )
}

export default ResponsiveNavigation


