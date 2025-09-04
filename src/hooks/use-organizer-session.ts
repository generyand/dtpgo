'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { EnhancedOrganizerSession, OrganizerSessionState } from '@/lib/auth/organizer-session';
import { OrganizerPermissions } from '@/lib/types/organizer';

/**
 * Custom hook for managing organizer session state
 */
export function useOrganizerSession() {
  const { user, loading: authLoading } = useAuth();
  const [sessionState, setSessionState] = useState<OrganizerSessionState>({
    currentSession: null,
    activeSessions: [],
    loading: true,
    error: null,
  });

  /**
   * Fetch organizer session data
   */
  const fetchOrganizerSession = useCallback(async () => {
    if (!user || authLoading) {
      setSessionState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setSessionState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/organizer/session');
      if (!response.ok) {
        throw new Error('Failed to fetch organizer session');
      }

      const data = await response.json();
      
      setSessionState(prev => ({
        ...prev,
        currentSession: data.session,
        activeSessions: data.activeSessions || [],
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error fetching organizer session:', error);
      setSessionState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load organizer session',
      }));
    }
  }, [user, authLoading]);

  /**
   * Refresh session data
   */
  const refreshSession = useCallback(() => {
    fetchOrganizerSession();
  }, [fetchOrganizerSession]);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: keyof OrganizerPermissions): boolean => {
    return sessionState.currentSession?.permissions[permission] ?? false;
  }, [sessionState.currentSession]);

  /**
   * Check if user has access to specific event
   */
  const hasEventAccess = useCallback((eventId: string): boolean => {
    return sessionState.currentSession?.assignedEvents.some(event => event.id === eventId) ?? false;
  }, [sessionState.currentSession]);

  /**
   * Get assigned events
   */
  const getAssignedEvents = useCallback(() => {
    return sessionState.currentSession?.assignedEvents ?? [];
  }, [sessionState.currentSession]);

  /**
   * Get active events (events that are currently happening)
   */
  const getActiveEvents = useCallback(() => {
    const now = new Date();
    return sessionState.currentSession?.assignedEvents.filter(event => 
      event.isActive && 
      event.startDate <= now && 
      event.endDate >= now
    ) ?? [];
  }, [sessionState.currentSession]);

  /**
   * Get upcoming events
   */
  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return sessionState.currentSession?.assignedEvents.filter(event => 
      event.isActive && 
      event.startDate > now
    ) ?? [];
  }, [sessionState.currentSession]);

  /**
   * Get past events
   */
  const getPastEvents = useCallback(() => {
    const now = new Date();
    return sessionState.currentSession?.assignedEvents.filter(event => 
      event.isActive && 
      event.endDate < now
    ) ?? [];
  }, [sessionState.currentSession]);

  /**
   * Track organizer activity
   */
  const trackActivity = useCallback(async (action: string, details?: Record<string, unknown>) => {
    try {
      await fetch('/api/organizer/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          details,
        }),
      });
    } catch (error) {
      console.error('Error tracking organizer activity:', error);
    }
  }, []);

  /**
   * Start a new session
   */
  const startSession = useCallback(async (eventId: string, sessionId: string) => {
    try {
      const response = await fetch('/api/organizer/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      // Refresh session data to get updated active sessions
      await refreshSession();
      
      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      return false;
    }
  }, [refreshSession]);

  /**
   * End a session
   */
  const endSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch('/api/organizer/sessions/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      // Refresh session data to get updated active sessions
      await refreshSession();
      
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }, [refreshSession]);

  // Fetch session data when user changes
  useEffect(() => {
    fetchOrganizerSession();
  }, [fetchOrganizerSession]);

  // Auto-refresh session data every 5 minutes
  useEffect(() => {
    if (!sessionState.currentSession) return;

    const interval = setInterval(() => {
      fetchOrganizerSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [sessionState.currentSession, fetchOrganizerSession]);

  return {
    // Session state
    currentSession: sessionState.currentSession,
    activeSessions: sessionState.activeSessions,
    loading: sessionState.loading,
    error: sessionState.error,

    // Session management
    refreshSession,
    startSession,
    endSession,

    // Permission checks
    hasPermission,
    hasEventAccess,

    // Event data
    getAssignedEvents,
    getActiveEvents,
    getUpcomingEvents,
    getPastEvents,

    // Activity tracking
    trackActivity,

    // Computed properties
    isOrganizer: sessionState.currentSession?.isOrganizer ?? false,
    isAdmin: sessionState.currentSession?.isAdmin ?? false,
    isActive: sessionState.currentSession?.isActive ?? false,
    organizerId: sessionState.currentSession?.organizerId,
    permissions: sessionState.currentSession?.permissions,
  };
}

/**
 * Hook for organizer session with automatic activity tracking
 */
export function useOrganizerSessionWithTracking() {
  const organizerSession = useOrganizerSession();
  const { trackActivity } = organizerSession;

  // Track page views
  useEffect(() => {
    if (organizerSession.currentSession) {
      trackActivity('page_view', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [organizerSession.currentSession, trackActivity]);

  return organizerSession;
}

/**
 * Hook for checking organizer permissions
 */
export function useOrganizerPermissions() {
  const { currentSession, hasPermission } = useOrganizerSession();

  return {
    canScanAttendance: hasPermission('canScanAttendance'),
    canViewSessions: hasPermission('canViewSessions'),
    canManageSessions: hasPermission('canManageSessions'),
    canViewAnalytics: hasPermission('canViewAnalytics'),
    canExportData: hasPermission('canExportData'),
    isOrganizer: currentSession?.isOrganizer ?? false,
    isAdmin: currentSession?.isAdmin ?? false,
  };
}

/**
 * Hook for organizer event management
 */
export function useOrganizerEvents() {
  const { 
    getAssignedEvents, 
    getActiveEvents, 
    getUpcomingEvents, 
    getPastEvents,
    hasEventAccess 
  } = useOrganizerSession();

  return {
    assignedEvents: getAssignedEvents(),
    activeEvents: getActiveEvents(),
    upcomingEvents: getUpcomingEvents(),
    pastEvents: getPastEvents(),
    hasEventAccess,
  };
}
