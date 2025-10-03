'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Eye, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Session {
  id: string;
  name: string;
  description?: string;
  eventId: string;
  event: {
    id: string;
    name: string;
    location?: string;
    startDate: string;
    endDate: string;
  };
  timeInStart: string;
  timeInEnd: string;
  timeOutStart?: string;
  timeOutEnd?: string;
  isActive: boolean;
  _count: {
    attendance: number;
  };
}

interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  upcomingSessions: number;
  totalAttendance: number;
  todayAttendance: number;
}

interface OrganizerDashboardProps {
  className?: string;
}

export function OrganizerDashboard({ className }: OrganizerDashboardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeSessions: 0,
    upcomingSessions: 0,
    totalAttendance: 0,
    todayAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sessionsResponse, statsResponse] = await Promise.all([
          fetch('/api/organizer/sessions'),
          fetch('/api/organizer/attendance?limit=1000')
        ]);

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          if (sessionsData.success) {
            setSessions(sessionsData.sessions);
          }
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            // Calculate stats from the data
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const activeSessions = sessions.filter(session => {
              const timeInStart = new Date(session.timeInStart);
              const timeInEnd = new Date(session.timeInEnd);
              const timeOutStart = session.timeOutStart ? new Date(session.timeOutStart) : null;
              const timeOutEnd = session.timeOutEnd ? new Date(session.timeOutEnd) : null;
              
              if (!session.isActive) return false;
              if (now >= timeInStart && now <= timeInEnd) return true;
              if (timeOutStart && timeOutEnd && now >= timeOutStart && now <= timeOutEnd) return true;
              return false;
            }).length;

            const upcomingSessions = sessions.filter(session => {
              const timeInStart = new Date(session.timeInStart);
              return session.isActive && now < timeInStart;
            }).length;

            const totalAttendance = sessions.reduce((sum, session) => sum + session._count.attendance, 0);
            
            const todayAttendance = statsData.attendance?.filter((record: { createdAt: Date | string }) => {
              const recordDate = new Date(record.createdAt);
              return recordDate >= today;
            }).length || 0;

            setStats({
              totalSessions: sessions.length,
              activeSessions,
              upcomingSessions,
              totalAttendance,
              todayAttendance
            });
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [sessions]);

  // Get session status
  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const timeInStart = new Date(session.timeInStart);
    const timeInEnd = new Date(session.timeInEnd);
    const timeOutStart = session.timeOutStart ? new Date(session.timeOutStart) : null;
    const timeOutEnd = session.timeOutEnd ? new Date(session.timeOutEnd) : null;

    if (!session.isActive) return 'inactive';
    if (now < timeInStart) return 'upcoming';
    if (now >= timeInStart && now <= timeInEnd) return 'active_time_in';
    if (timeOutStart && timeOutEnd && now >= timeOutStart && now <= timeOutEnd) return 'active_time_out';
    if (timeOutEnd && now > timeOutEnd) return 'ended';
    if (!timeOutEnd && now > timeInEnd) return 'ended';
    
    return 'inactive';
  };

  // Get session status badge
  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'active_time_in':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Time In Active</Badge>;
      case 'active_time_out':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Time Out Active</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Upcoming</Badge>;
      case 'ended':
        return <Badge className="bg-muted text-muted-foreground border-border">Ended</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">Inactive</Badge>;
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle session action
  const handleSessionAction = (session: Session, action: 'view' | 'scan') => {
    if (action === 'scan') {
      router.push(`/organizer/scan/manual?sessionId=${session.id}`);
    } else {
      router.push(`/organizer/sessions/${session.id}`);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your session overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/organizer/sessions')}>
            <Eye className="h-4 w-4 mr-2" />
            View All Sessions
          </Button>
          <Button onClick={() => router.push('/organizer/sessions')}>
            <Activity className="h-4 w-4 mr-2" />
            Manage Sessions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for later
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Attendance</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.todayAttendance}</div>
            <p className="text-xs text-muted-foreground">
              Students scanned today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your next scheduled sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.filter(session => getSessionStatus(session) === 'upcoming').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions
                  .filter(session => getSessionStatus(session) === 'upcoming')
                  .slice(0, 3)
                  .map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{session.name}</h4>
                        <p className="text-sm text-muted-foreground">{session.event.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(session.timeInStart)} at {formatTime(session.timeInStart)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSessionStatusBadge(getSessionStatus(session))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSessionAction(session, 'view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Sessions currently accepting attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.filter(session => 
              getSessionStatus(session) === 'active_time_in' || 
              getSessionStatus(session) === 'active_time_out'
            ).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions
                  .filter(session => 
                    getSessionStatus(session) === 'active_time_in' || 
                    getSessionStatus(session) === 'active_time_out'
                  )
                  .slice(0, 3)
                  .map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{session.name}</h4>
                        <p className="text-sm text-muted-foreground">{session.event.name}</p>
                        <p className="text-xs text-gray-500">
                          {session._count.attendance} students scanned
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSessionStatusBadge(getSessionStatus(session))}
                        <Button
                          size="sm"
                          onClick={() => handleSessionAction(session, 'scan')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Scan
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/organizer/sessions')}
            >
              <Calendar className="h-6 w-6" />
              <span>View All Sessions</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/organizer/scan/manual')}
            >
              <Users className="h-6 w-6" />
              <span>Manual Entry</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/organizer/sessions')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
