'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Organizer {
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
}

export interface OrganizersResponse {
  success: boolean;
  organizers: Organizer[];
  count: number;
}

export interface UseOrganizersOptions {
  search?: string;
  role?: 'organizer' | 'admin' | 'all';
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
}

export interface UseOrganizersReturn {
  organizers: Organizer[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useOrganizers(options: UseOrganizersOptions = {}): UseOrganizersReturn {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const {
    search = '',
    role = 'all',
    status = 'all',
    page = 1,
    limit = 10
  } = options;

  const fetchOrganizers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search) params.set('search', search);
      if (role !== 'all') params.set('role', role);
      if (status !== 'all') params.set('status', status);

      const response = await fetch(`/api/admin/organizers?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organizers: ${response.statusText}`);
      }

      const data: OrganizersResponse = await response.json();
      
      if (data.success) {
        setOrganizers(data.organizers);
        setTotal(data.count);
      } else {
        throw new Error('Failed to fetch organizers');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to load organizers: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page, limit]);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  const hasNextPage = page * limit < total;
  const hasPreviousPage = page > 1;

  return {
    organizers,
    loading,
    error,
    total,
    refetch: fetchOrganizers,
    hasNextPage,
    hasPreviousPage,
  };
}
