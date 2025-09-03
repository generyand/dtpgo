import React from 'react';
import { Metadata } from 'next';

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
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
