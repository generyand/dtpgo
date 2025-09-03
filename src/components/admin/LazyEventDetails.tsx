'use client'

import React, { Suspense } from 'react'
import useLazyLoading from '@/lib/hooks/useLazyLoading'
import { Skeleton } from '@/components/ui/loading'

export interface LazyEventDetailsProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>
  fallbackHeight?: number
  componentProps?: Record<string, any>
}

export function LazyEventDetails({ loader, fallbackHeight = 240, componentProps }: LazyEventDetailsProps) {
  const { ref, isInView } = useLazyLoading<HTMLDivElement>({ rootMargin: '400px', threshold: 0 })
  const LazyComp = React.useMemo(() => React.lazy(loader), [loader])

  return (
    <div ref={ref}>
      {isInView ? (
        <Suspense fallback={<Skeleton style={{ height: fallbackHeight }} />}>
          <LazyComp {...componentProps} />
        </Suspense>
      ) : (
        <Skeleton style={{ height: fallbackHeight }} />
      )}
    </div>
  )
}

export default LazyEventDetails


