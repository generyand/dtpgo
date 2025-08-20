'use client';

import React from 'react';
import { useActivityApi } from '@/hooks/use-activity-api';
import SimplifiedActivityFeed from './SimplifiedActivityFeed';

// Transform activity data to simplified format
const transformActivity = (activity: any): {
  id: string;
  type: 'registration' | 'qr_generation' | 'admin_action' | 'system';
  description: string;
  userName?: string;
  createdAt: Date | string;
  severity?: 'low' | 'medium' | 'high';
} => ({
  id: activity.id,
  type: activity.type === 'student_registration' ? 'registration' :
        activity.type === 'qr_code_generation' ? 'qr_generation' :
        activity.type === 'admin_action' ? 'admin_action' : 'system',
  description: activity.description || activity.action || 'System activity',
  userName: activity.student 
    ? `${activity.student.firstName} ${activity.student.lastName}`.trim()
    : activity.admin?.email?.split('@')[0] || undefined,
  createdAt: activity.createdAt,
  severity: activity.severity === 'warning' ? 'medium' :
           activity.severity === 'error' || activity.severity === 'critical' ? 'high' : 'low'
});

export function SimplifiedActivityContainer() {
  const { activities, loading, error, refresh } = useActivityApi({
    limit: 10,
    pollingInterval: 30000, // 30 seconds
    enablePolling: true
  });

  // Transform activities to simplified format
  const simplifiedActivities = activities?.map(transformActivity) || [];

  return (
    <SimplifiedActivityFeed
      activities={simplifiedActivities}
      loading={loading}
      error={error || undefined}
      onRefresh={refresh}
    />
  );
}

export default SimplifiedActivityContainer;
