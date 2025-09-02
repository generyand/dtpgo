import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen w-full">
      {/* Mobile */}
      <div className="lg:hidden p-4 pb-24 space-y-5">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        {/* Metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="h-5 w-28 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Analytics block */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="h-5 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
          <div className="h-40 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block h-screen w-full overflow-hidden">
        <div className="h-full overflow-y-auto pr-0">
          <div className="space-y-6 p-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Metrics grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            {/* Two column sections */}
            <div className="grid gap-6 lg:grid-cols-2">
              {[0,1].map((k) => (
                <div key={k} className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
                    <div>
                      <div className="h-5 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Analytics */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-72 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
