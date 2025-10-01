/**
 * Admin Layout
 *
 * This layout component wraps all pages in the admin route.
 * It provides a consistent layout and protects routes using role-based access control.
 * Only users with 'admin' role can access admin routes.
 */
import React from 'react';
import { AdminOnly } from '@/components/auth/RoleGuard';
import AdminNav from '@/components/admin/AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminOnly redirectTo="/organizer/sessions">
      <div className="grid w-full lg:grid-cols-[280px_1fr] min-h-screen overflow-hidden">
        <AdminNav />
        <div className="flex flex-col min-w-0"> {/* min-w-0 prevents flex child from overflowing */}
          <main className="flex-1 overflow-x-auto min-h-[calc(100vh-4rem)] lg:min-h-screen pt-16 lg:pt-0 bg-gradient-to-br from-yellow-50/40 via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            {children}
          </main>
        </div>
      </div>
    </AdminOnly>
  );
} 