'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Clock, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { EventWithDetails } from '@/lib/types/event';
import { SessionWithDetails } from '@/lib/types/session';

interface EventDetailsProps {
  event: EventWithDetails;
  onClose: () => void;
}

export function EventDetails({ event, onClose }: EventDetailsProps) {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch additional event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch sessions
        const sessionsResponse = await fetch(`/api/admin/sessions?eventId=${event.id}&limit=100`);
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          if (sessionsData.success) {
            setSessions(sessionsData.sessions);
          }
        }

        // Fetch organizers
        const organizersResponse = await fetch(`/api/admin/events/${event.id}/organizers`);
        if (organizersResponse.ok) {
          const organizersData = await organizersResponse.json();
          if (organizersData.success) {
            setOrganizers(organizersData.assignedOrganizers);
          }
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [event.id]);

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format time for display
  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  // Get session status
  const getSessionStatus = (session: SessionWithDetails) => {
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
        return <Badge variant="outline" className="text-blue-600">Upcoming</Badge>;
      case 'active_time_in':
        return <Badge variant="default" className="bg-green-600">Time-In Active</Badge>;
      case 'active_time_out':
        return <Badge variant="default" className="bg-orange-600">Time-Out Active</Badge>;
      case 'ended':
        return <Badge variant="secondary">Ended</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-600">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
            <Badge variant={getStatusBadgeVariant(event.isActive)}>
              {event.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {event.description && (
            <p className="text-gray-600 mb-4">{event.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Start:</span>
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">End:</span>
              <span>{formatDate(event.endDate)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Location:</span>
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Sessions:</span>
              <span>{event._count.sessions}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="organizers">Organizers</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sessions</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </div>
          
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No sessions</h4>
                <p className="text-gray-500 mb-4">This event doesn't have any sessions yet.</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const status = getSessionStatus(session);
                return (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{session.name}</h4>
                            {getSessionStatusBadge(status)}
                          </div>
                          
                          {session.description && (
                            <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                            <div>
                              <span className="font-medium">Time-In:</span> {formatTime(session.timeInStart)} - {formatTime(session.timeInEnd)}
                            </div>
                            {session.timeOutStart && session.timeOutEnd && (
                              <div>
                                <span className="font-medium">Time-Out:</span> {formatTime(session.timeOutStart)} - {formatTime(session.timeOutEnd)}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Attendance:</span> {session._count.attendance} records
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Organizers Tab */}
        <TabsContent value="organizers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assigned Organizers</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Assign Organizer
            </Button>
          </div>
          
          {organizers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No organizers assigned</h4>
                <p className="text-gray-500 mb-4">This event doesn't have any organizers assigned yet.</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign First Organizer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {organizers.map((assignment) => (
                <Card key={assignment.assignmentId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{assignment.organizer.fullName}</h4>
                          <p className="text-sm text-gray-600">{assignment.organizer.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={assignment.organizer.role === 'admin' ? 'default' : 'secondary'}>
                              {assignment.organizer.role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <h3 className="text-lg font-semibold">Event Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{event._count.sessions}</div>
                <p className="text-xs text-muted-foreground">
                  {sessions.filter(s => s.isActive).length} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Assigned Organizers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{event._count.organizerAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  {organizers.filter(o => o.organizer.isActive).length} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{event._count.attendance}</div>
                <p className="text-xs text-muted-foreground">
                  Across all sessions
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
}
