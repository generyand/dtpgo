/**
 * Admin Dashboard Page
 *
 * Displays key metrics and an overview of recent activity.
 */
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, BarChart3, AlertTriangle } from 'lucide-react'
import { countStudents } from '@/lib/db/queries/students'
import { getPrograms } from '@/lib/db/queries/programs'

export default async function DashboardPage() {
  let totalStudents = 0
  let totalPrograms = 0
  let recentRegistrations = 0
  let dbError: string | null = null

  try {
    totalStudents = await countStudents({})
    const programs = await getPrograms()
    totalPrograms = programs.length
    // Temporary approximation until a real recent metric is added
    recentRegistrations = totalStudents
  } catch {
    dbError = 'Database not connected or unreachable'
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {dbError && (
        <div className="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Limited data: {dbError}</p>
            <p className="text-sm opacity-80">Once the database is available, live metrics will appear automatically.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">All-time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Programs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrograms}</div>
            <p className="text-xs text-muted-foreground">Active programs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Registrations</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{recentRegistrations}</div>
            <p className="text-xs text-muted-foreground">Approximation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 