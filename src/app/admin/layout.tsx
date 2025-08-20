/**
 * Admin Layout
 *
 * This layout component wraps all pages in the admin route.
 * It provides a consistent layout and protects routes using AdminGuard.
 */
import React from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminNav />
        <div className="flex flex-col">
          <main className="flex-1 bg-gradient-to-br from-yellow-50/40 via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
} 