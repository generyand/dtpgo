import React from 'react'

export default function Loading() {
  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse hidden sm:block" />
          <div className="h-9 w-9 bg-gray-200 rounded animate-pulse sm:hidden" />
          <div className="h-9 w-9 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="h-10 w-full max-w-md bg-gray-100 rounded animate-pulse" />
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="p-3 sm:p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-full bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
