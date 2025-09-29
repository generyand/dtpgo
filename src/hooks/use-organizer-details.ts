'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface OrganizerDetails {
  id: string;
  email: string;
  fullName: string;
  role: 'organizer' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  invitedBy?: string;
  invitedAt?: string;
  eventAssignments: Array<{
    id: string;
    event: {
      id: string;
      name: string;
      description?: string;
      startDate: string;
      endDate: string;
      status: string;
    };
    assignedAt: string;
  }>;
  activities: Array<{
    id: string;
    action: string;
    details: string;
    createdAt: string;
  }>;
  statistics: {
    totalAssignments: number;
    activeEvents: number;
    recentActivityCount: number;
  };
}

export interface UseOrganizerDetailsReturn {
  organizer: OrganizerDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrganizer: (data: Partial<OrganizerDetails>) => Promise<boolean>;
  deactivateOrganizer: () => Promise<boolean>;
}

export function useOrganizerDetails(organizerId: string): UseOrganizerDetailsReturn {
  const [organizer, setOrganizer] = useState<OrganizerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizerDetails = async () => {
    if (!organizerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/organizers/${organizerId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Organizer not found');
        }
        throw new Error(`Failed to fetch organizer details: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setOrganizer(data.organizer);
      } else {
        throw new Error(data.error || 'Failed to fetch organizer details');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching organizer details:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizer = async (data: Partial<OrganizerDetails>): Promise<boolean> => {
    if (!organizerId) return false;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/organizers/${organizerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update organizer: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setOrganizer(prev => prev ? { ...prev, ...result.organizer } : null);
        toast.success('Organizer updated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to update organizer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error(`Failed to update organizer: ${errorMessage}`);
      console.error('Error updating organizer:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateOrganizer = async (): Promise<boolean> => {
    if (!organizerId) return false;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/organizers/${organizerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to deactivate organizer: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setOrganizer(prev => prev ? { ...prev, isActive: false } : null);
        toast.success('Organizer deactivated successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to deactivate organizer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error(`Failed to deactivate organizer: ${errorMessage}`);
      console.error('Error deactivating organizer:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerDetails();
  }, [organizerId]);

  return {
    organizer,
    loading,
    error,
    refetch: fetchOrganizerDetails,
    updateOrganizer,
    deactivateOrganizer,
  };
}
