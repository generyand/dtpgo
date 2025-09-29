/**
 * Organizer Management Page
 * 
 * This page provides a comprehensive interface for managing organizers.
 * It includes organizer statistics, search functionality, and organizer management tools.
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { OrganizerList } from '@/components/admin/organizers/OrganizerList';
import { OrganizerStats } from '@/components/admin/organizers/OrganizerStats';

export const dynamic = 'force-dynamic';

export default function OrganizersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizer Management</h1>
          <p className="text-muted-foreground">
            Manage organizers, invitations, and event assignments
          </p>
        </div>
        <Link href="/admin/organizers/invite">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Invite Organizer
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <OrganizerStats showAssignments={true} autoRefresh={true} />

      {/* Organizer List Section */}
      <OrganizerList />
    </div>
  );
}
