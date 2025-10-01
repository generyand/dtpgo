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
      <div className="flex min-h-screen bg-gray-50">
        {/* Navigation Sidebar */}
        <OrganizerNav />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </OrganizerOnly>
  );
}
