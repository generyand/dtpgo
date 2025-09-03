import React from 'react';
import { Metadata } from 'next';
import { OrganizerOnly } from '@/components/auth/RoleGuard';

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
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </OrganizerOnly>
  );
}
