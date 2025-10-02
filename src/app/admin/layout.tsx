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
      <div className="min-h-screen">
        <AdminNav />
        <div className="lg:ml-[280px]"> {/* Add left margin to account for fixed sidebar */}
          <main className="min-h-screen pt-16 lg:pt-0 bg-gradient-to-br from-yellow-50/40 via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            {children}
          </main>
        </div>
      </div>
    </AdminOnly>
  );
} 