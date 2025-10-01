import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen w-full p-6 flex items-center justify-center bg-gradient-to-br from-yellow-50/40 via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {children}
    </main>
  );
} 