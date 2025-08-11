/**
 * Admin Dashboard Page
 *
 * This is the main dashboard page for the admin panel.
 * It displays key metrics and an overview of recent activity.
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, BarChart3 } from 'lucide-react';
import { countStudents } from '@/lib/db/queries/students';
import { getPrograms } from '@/lib/db/queries/programs';

export default async function DashboardPage() {
  const totalStudents = await countStudents({});
  const programs = await getPrograms();
  const totalPrograms = programs.length;

  // Placeholder for recent registrations
  const recentRegistrations = await countStudents({
    search: '',
    programId: '',
    year: undefined,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Programs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrograms}</div>
            <p className="text-xs text-muted-foreground">All active programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Registrations</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{recentRegistrations}</div>
            <p className="text-xs text-muted-foreground">In the last 24 hours</p>
          </CardContent>
        </Card>
      </div>
      {/* Add more dashboard components here, like recent activity table */}
    </div>
  );
} 