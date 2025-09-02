import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoleGuard, AdminOnly, OrganizerOnly, OrganizerOrAdmin, PermissionGuard } from './RoleGuard';
import { AuthProvider } from '@/components/providers/AuthProvider';

// Mock the Supabase client
const mockSupabaseAuth = {
  getSession: jest.fn(),
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
  getUser: jest.fn(),
  refreshSession: jest.fn(),
  onAuthStateChange: jest.fn(),
};

jest.mock('@/lib/auth/supabase', () => ({
  createSupabaseBrowserClient: jest.fn(() => ({
    auth: mockSupabaseAuth,
  })),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });
  });

  describe('AdminOnly', () => {
    it('renders children when user is admin', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <AdminOnly>
            <div>Admin Content</div>
          </AdminOnly>
        </TestWrapper>
      );

      await screen.findByText('Admin Content');
    });

    it('shows access denied when user is not admin', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          user_metadata: { role: 'organizer' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <AdminOnly>
            <div>Admin Content</div>
          </AdminOnly>
        </TestWrapper>
      );

      await screen.findByText('Access Restricted');
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('shows login prompt when user is not authenticated', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <TestWrapper>
          <AdminOnly>
            <div>Admin Content</div>
          </AdminOnly>
        </TestWrapper>
      );

      await screen.findByText('Please sign in to access this content');
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('OrganizerOnly', () => {
    it('renders children when user is organizer', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'organizer@example.com',
          user_metadata: { role: 'organizer' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <OrganizerOnly>
            <div>Organizer Content</div>
          </OrganizerOnly>
        </TestWrapper>
      );

      await screen.findByText('Organizer Content');
    });

    it('shows access denied when user is not organizer', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          user_metadata: { role: 'admin' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <OrganizerOnly>
            <div>Organizer Content</div>
          </OrganizerOnly>
        </TestWrapper>
      );

      await screen.findByText('Access Restricted');
      expect(screen.queryByText('Organizer Content')).not.toBeInTheDocument();
    });
  });

  describe('OrganizerOrAdmin', () => {
    it('renders children when user is admin', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <OrganizerOrAdmin>
            <div>Admin/Organizer Content</div>
          </OrganizerOrAdmin>
        </TestWrapper>
      );

      await screen.findByText('Admin/Organizer Content');
    });

    it('renders children when user is organizer', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'organizer@example.com',
          user_metadata: { role: 'organizer' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <OrganizerOrAdmin>
            <div>Admin/Organizer Content</div>
          </OrganizerOrAdmin>
        </TestWrapper>
      );

      await screen.findByText('Admin/Organizer Content');
    });

    it('shows access denied when user has no role', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          user_metadata: {}
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <OrganizerOrAdmin>
            <div>Admin/Organizer Content</div>
          </OrganizerOrAdmin>
        </TestWrapper>
      );

      await screen.findByText('Access Restricted');
      expect(screen.queryByText('Admin/Organizer Content')).not.toBeInTheDocument();
    });
  });

  describe('PermissionGuard', () => {
    it('renders children when user has required permission', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <PermissionGuard permission="canViewAnalytics">
            <div>Analytics Content</div>
          </PermissionGuard>
        </TestWrapper>
      );

      await screen.findByText('Analytics Content');
    });

    it('shows access denied when user lacks required permission', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'organizer@example.com',
          user_metadata: { role: 'organizer' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <PermissionGuard permission="canManageStudents">
            <div>Student Management Content</div>
          </PermissionGuard>
        </TestWrapper>
      );

      await screen.findByText('Access Restricted');
      expect(screen.queryByText('Student Management Content')).not.toBeInTheDocument();
    });

    it('shows custom fallback when provided', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'organizer@example.com',
          user_metadata: { role: 'organizer' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <PermissionGuard 
            permission="canManageStudents" 
            fallback={<div>Custom Access Denied</div>}
          >
            <div>Student Management Content</div>
          </PermissionGuard>
        </TestWrapper>
      );

      await screen.findByText('Custom Access Denied');
      expect(screen.queryByText('Student Management Content')).not.toBeInTheDocument();
    });
  });

  describe('RoleGuard with custom props', () => {
    it('renders children when user has required role', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          user_metadata: { role: 'admin' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <RoleGuard requiredRole="admin">
            <div>Admin Content</div>
          </RoleGuard>
        </TestWrapper>
      );

      await screen.findByText('Admin Content');
    });

    it('renders children when user has one of allowed roles', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'organizer@example.com',
          user_metadata: { role: 'organizer' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <RoleGuard allowedRoles={['admin', 'organizer']}>
            <div>Admin/Organizer Content</div>
          </RoleGuard>
        </TestWrapper>
      );

      await screen.findByText('Admin/Organizer Content');
    });

    it('shows custom fallback when user lacks required role', async () => {
      const mockSession = {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          user_metadata: { role: 'organizer' }
        },
        access_token: 'token',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <TestWrapper>
          <RoleGuard 
            requiredRole="admin" 
            fallback={<div>Custom Admin Only</div>}
          >
            <div>Admin Content</div>
          </RoleGuard>
        </TestWrapper>
      );

      await screen.findByText('Custom Admin Only');
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });
});
