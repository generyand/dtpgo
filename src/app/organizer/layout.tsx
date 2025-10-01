import React from 'react';
import { Metadata } from 'next';
import { OrganizerOnly } from '@/components/auth/RoleGuard';
import { OrganizerNav } from '@/components/organizer/OrganizerNav';

export const metadata: Metadata = {
  title: 'Organizer Portal - DTP Attendance System',
  description: 'Organizer portal for managing attendance sessions',
};

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizerOnly redirectTo="/admin/dashboard">
      <div className="grid w-full lg:grid-cols-[280px_1fr] min-h-screen overflow-hidden">
        <OrganizerNav />
        <div className="flex flex-col min-w-0"> {/* min-w-0 prevents flex child from overflowing */}
          <main className="flex-1 overflow-x-auto min-h-[calc(100vh-4rem)] lg:min-h-screen pt-16 lg:pt-0 bg-gradient-to-br from-yellow-50/40 via-white to-amber-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
            {children}
          </main>
        </div>
      </div>
    </OrganizerOnly>
  );
}
