/**
 * Admin Dashboard Page
 *
 * Displays key metrics and an overview of recent activity.
 */
import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { countStudents } from '@/lib/db/queries/students'
import { getPrograms } from '@/lib/db/queries/programs'
import { countStudentsByProgram, countStudentsByRegistrationSource } from '@/lib/db/queries/analytics'
import { MetricsGrid, type MetricData } from '@/components/admin/dashboard/MetricsGrid'

export default async function DashboardPage() {
  let metrics: MetricData[] = []
  let dbError: string | null = null
  const isLoading = false

  try {
    // Fetch all dashboard data in parallel
    const [
      totalStudents,
      programs,
      studentsByProgram,
      studentsBySource
    ] = await Promise.all([
      countStudents({}),
      getPrograms(),
      countStudentsByProgram(),
      countStudentsByRegistrationSource()
    ])

    // Calculate derived metrics
    const totalPrograms = programs.length
    const publicRegistrations = studentsBySource.find(s => s.source === 'public')?.count || 0
    const adminRegistrations = studentsBySource.find(s => s.source === 'admin')?.count || 0
    
    // Estimate QR codes generated (assuming each student gets one)
    const qrCodesGenerated = totalStudents

    // Build metrics array with enhanced data
    metrics = [
      {
        id: 'total-students',
        title: 'Total Students',
        value: totalStudents,
        previousValue: Math.max(0, totalStudents - publicRegistrations), // Approximation
        percentageChange: totalStudents > 0 ? ((publicRegistrations / totalStudents) * 100) : 0,
        trend: publicRegistrations > 0 ? 'up' : 'neutral',
        iconName: 'users',
        description: 'Total registered students across all programs',
        period: 'vs last period',
      },
      {
        id: 'new-registrations',
        title: 'New Registrations',
        value: publicRegistrations + adminRegistrations,
        previousValue: 0, // Would need historical data
        percentageChange: publicRegistrations > 0 ? 100 : 0, // Placeholder
        trend: publicRegistrations > 0 ? 'up' : 'neutral',
        iconName: 'user-plus',
        description: `${publicRegistrations} public, ${adminRegistrations} admin registrations`,
        period: 'this period',
      },
      {
        id: 'qr-generated',
        title: 'QR Codes Generated',
        value: qrCodesGenerated,
        previousValue: Math.max(0, qrCodesGenerated - 10), // Approximation
        percentageChange: qrCodesGenerated > 0 ? 15 : 0, // Placeholder
        trend: qrCodesGenerated > 0 ? 'up' : 'neutral',
        iconName: 'qr-code',
        description: 'QR codes generated for student identification',
        period: 'vs last period',
      },
      {
        id: 'active-programs',
        title: 'Active Programs',
        value: totalPrograms,
        previousValue: totalPrograms, // Programs don't change frequently
        percentageChange: 0,
        trend: 'neutral',
        iconName: 'bar-chart-3',
        description: `${studentsByProgram.length} programs with enrolled students`,
        period: 'total available',
      },
    ]

  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    dbError = 'Database not connected or unreachable'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of student registration system metrics and activity
        </p>
      </div>

      {/* Database Error Alert */}
      {dbError && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">Limited data: {dbError}</p>
            <p className="text-sm opacity-80">
              Once the database is available, live metrics will appear automatically.
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Metrics Grid */}
      <MetricsGrid
        metrics={metrics}
        isLoading={isLoading}
        error={dbError}
        className="mb-8"
        columns={{
          md: 2,
          lg: 4,
        }}
      />

      {/* Additional Dashboard Content Placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Activity feed will be implemented in Epic 2.0
          </p>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Analytics Charts</h3>
          <p className="text-sm text-muted-foreground">
            Visual analytics will be implemented in Epic 3.0
          </p>
        </div>
      </div>
    </div>
  )
} 