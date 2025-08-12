import React from 'react';

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="container mx-auto max-w-lg p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
} 