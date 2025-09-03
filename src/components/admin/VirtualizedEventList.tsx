'use client'

import React from 'react'
import useVirtualization from '@/lib/hooks/useVirtualization'

export interface VirtualizedEventListProps<TItem extends { id: string }> {
  items: TItem[]
  rowHeight?: number
  renderRow: (item: TItem, index: number) => React.ReactNode
  className?: string
}

export function VirtualizedEventList<TItem extends { id: string }>({
  items,
  rowHeight = 56,
  renderRow,
  className,
}: VirtualizedEventListProps<TItem>) {
  const { containerRef, totalHeight, startIndex, endIndex, offsetTop } = useVirtualization({
    itemCount: items.length,
    itemHeight: rowHeight,
    overscan: 6,
  })

  const visibleItems = items.slice(startIndex, endIndex + 1)

  return (
    <div ref={containerRef} className={className ?? 'h-[480px] overflow-auto'}>
      <div style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetTop}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={item.id} style={{ height: rowHeight }}>
              {renderRow(item, startIndex + i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VirtualizedEventList


