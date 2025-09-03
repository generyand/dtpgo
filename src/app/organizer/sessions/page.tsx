import { Metadata } from 'next';
import { Suspense } from 'react';
import { SessionSelector } from '@/components/organizer/SessionSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Sessions | DTP Attendance Organizer',
  description: 'View and manage your assigned attendance sessions',
};

export default function OrganizerSessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
              <p className="text-gray-600">Manage your assigned attendance sessions</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-xs text-muted-foreground">
                Scheduled for later
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scanned</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <p className="text-xs text-muted-foreground">
                Students scanned today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Session Selector */}
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Loading Sessions...</CardTitle>
              <CardDescription>Please wait while we load your assigned sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        }>
          <SessionSelector />
        </Suspense>

        {/* Help Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
              <CardDescription>
                Here are some quick tips for using the session management system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Active Sessions</h4>
                  <p className="text-sm text-gray-600">
                    Click on any active session to start scanning QR codes. Make sure you have camera permissions enabled.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Session Status</h4>
                  <p className="text-sm text-gray-600">
                    Sessions are color-coded: Green for active time-in, Orange for active time-out, Blue for upcoming.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Time Windows</h4>
                  <p className="text-sm text-gray-600">
                    Students can only scan during the configured time windows. Check the session details for exact times.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Support</h4>
                  <p className="text-sm text-gray-600">
                    If you encounter any issues, contact your administrator or check the system status.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
