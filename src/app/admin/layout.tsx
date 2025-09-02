/**
 * Admin Layout
 *
 * This layout component wraps all pages in the admin route.
 * It provides a consistent layout and protects routes using role-based access control.
 * Only users with 'admin' or 'organizer' roles can access admin routes.
 */
import React from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { OrganizerOrAdmin } from '@/components/auth/RoleGuard';
import AdminNav from '@/components/admin/AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard requireAuth={true}>
      <OrganizerOrAdmin>
        <div className="grid w-full lg:grid-cols-[280px_1fr] overflow-hidden">
          <AdminNav />
          <div className="flex flex-col">
            <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen pt-16 lg:pt-0 overflow-y-auto bg-gradient-to-br from-yellow-50/40 via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
              {children}
            </main>
          </div>
        </div>
      </OrganizerOrAdmin>
    </AdminGuard>
  );
} 