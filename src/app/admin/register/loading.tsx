import React from 'react'

export default function Loading() {
  return (
    <div className="w-full">
      <div className="bg-white rounded-none border-b p-6">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full bg-gray-100 rounded animate-pulse" />
        ))}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
