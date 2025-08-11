/**
 * Admin Layout
 *
 * This layout component wraps all pages in the (admin) route group.
 * It provides a consistent layout for the admin dashboard and protects
 * routes using the AdminGuard component.
 */
import React from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AdminGuard } from '@/components/auth/AdminGuard';
import AdminNav from '@/components/admin/AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthProvider>
      <AdminGuard>
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
          <AdminNav />
          <div className="flex flex-col">
            <main className="flex-1 bg-gray-100/40 p-4 sm:p-6 lg:p-8 dark:bg-gray-800/40">
              {children}
            </main>
          </div>
        </div>
      </AdminGuard>
    </AuthProvider>
  );
} 