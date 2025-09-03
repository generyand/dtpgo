'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MapPin, Calendar, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
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

interface SessionSelectorProps {
  onSessionSelect?: (session: Session) => void;
  className?: string;
}

export function SessionSelector({ onSessionSelect, className }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch assigned sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/organizer/sessions');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSessions(data.sessions);
          } else {
            setError(data.message || 'Failed to load sessions');
          }
        } else {
          setError('Failed to load sessions');
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

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
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Upcoming</Badge>;
      case 'active_time_in':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Time-In Active</Badge>;
      case 'active_time_out':
        return <Badge variant="default" className="bg-orange-600 hover:bg-orange-700">Time-Out Active</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get session status icon
  const getSessionStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'active_time_in':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'active_time_out':
        return <Pause className="h-4 w-4 text-orange-600" />;
      case 'ended':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Format time for display
  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle session selection
  const handleSessionSelect = (session: Session) => {
    const status = getSessionStatus(session);
    
    // Only allow selection of active sessions
    if (status === 'active_time_in' || status === 'active_time_out') {
      setSelectedSessionId(session.id);
      if (onSessionSelect) {
        onSessionSelect(session);
      } else {
        // Navigate to scanning interface
        router.push(`/organizer/scan?sessionId=${session.id}`);
      }
    } else {
      toast.error('This session is not currently active');
    }
  };

  // Filter sessions by status
  const activeSessions = sessions.filter(session => {
    const status = getSessionStatus(session);
    return status === 'active_time_in' || status === 'active_time_out';
  });

  const upcomingSessions = sessions.filter(session => {
    const status = getSessionStatus(session);
    return status === 'upcoming';
  });

  const endedSessions = sessions.filter(session => {
    const status = getSessionStatus(session);
    return status === 'ended';
  });

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Sessions</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Assigned</h3>
            <p className="text-gray-600 mb-4">
              You don't have any sessions assigned to you yet. Contact your administrator to get assigned to events.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {activeSessions.length}
              </Badge>
            </div>
            <div className="grid gap-4">
              {activeSessions.map((session) => {
                const status = getSessionStatus(session);
                return (
                  <Card 
                    key={session.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSessionId === session.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSessionSelect(session)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSessionStatusIcon(status)}
                            <h3 className="font-semibold text-gray-900">{session.name}</h3>
                            {getSessionStatusBadge(status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {session.event.name}
                            </div>
                            {session.event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {session.event.location}
                              </div>
                            )}
                          </div>

                          {session.description && (
                            <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                            <div>
                              <span className="font-medium">Time-In:</span> {formatTime(session.timeInStart)} - {formatTime(session.timeInEnd)}
                            </div>
                            {session.timeOutStart && session.timeOutEnd && (
                              <div>
                                <span className="font-medium">Time-Out:</span> {formatTime(session.timeOutStart)} - {formatTime(session.timeOutEnd)}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{session._count.attendance} scanned</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Start Scanning
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {upcomingSessions.length}
              </Badge>
            </div>
            <div className="grid gap-4">
              {upcomingSessions.map((session) => {
                const status = getSessionStatus(session);
                return (
                  <Card key={session.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSessionStatusIcon(status)}
                            <h3 className="font-semibold text-gray-900">{session.name}</h3>
                            {getSessionStatusBadge(status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {session.event.name}
                            </div>
                            {session.event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {session.event.location}
                              </div>
                            )}
                          </div>

                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Starts:</span> {formatDate(session.timeInStart)} at {formatTime(session.timeInStart)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Ended Sessions */}
        {endedSessions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
              <Badge variant="secondary">
                {endedSessions.length}
              </Badge>
            </div>
            <div className="grid gap-4">
              {endedSessions.slice(0, 3).map((session) => {
                const status = getSessionStatus(session);
                return (
                  <Card key={session.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSessionStatusIcon(status)}
                            <h3 className="font-semibold text-gray-900">{session.name}</h3>
                            {getSessionStatusBadge(status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {session.event.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{session._count.attendance} scanned</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
