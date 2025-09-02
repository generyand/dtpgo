import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthProvider';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase';

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

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, session, loading, error, signIn, signOut, resetPassword, updatePassword, hasRole, isAdmin, isOrganizer } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <div data-testid="is-admin">{isAdmin() ? 'admin' : 'not-admin'}</div>
      <div data-testid="is-organizer">{isOrganizer() ? 'organizer' : 'not-organizer'}</div>
      <div data-testid="has-role">{hasRole('admin') ? 'has-admin-role' : 'no-admin-role'}</div>
      <button onClick={() => signIn({ email: 'test@example.com', password: 'password' })}>
        Sign In
      </button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => resetPassword('test@example.com')}>Reset Password</button>
      <button onClick={() => updatePassword('oldpass', 'newpass')}>Update Password</button>
    </div>
  );
};

describe('AuthProvider', () => {
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });
  });

  it('renders children and provides auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('user')).toBeInTheDocument();
  });

  it('initializes with loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('handles initial session loading', async () => {
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { role: 'admin' }
      },
      access_token: 'token',
      refresh_token: 'refresh',
    };

    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
    });
  });

  it('handles session loading error', async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Session error' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('error')).toHaveTextContent('Session error');
    });
  });

  it('handles auth state changes', async () => {
    let authStateChangeCallback: (event: string, session: any) => void;

    mockSupabaseAuth.onAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Simulate auth state change
    const mockSession = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        user_metadata: { role: 'admin' }
      },
      access_token: 'token',
    };

    act(() => {
      authStateChangeCallback('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
    });
  });

  it('handles successful sign in', async () => {
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    const signInButton = screen.getByText('Sign In');
    
    await act(async () => {
      signInButton.click();
    });

    expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('handles sign in error', async () => {
    const errorMessage = 'Invalid credentials';
    mockSupabaseAuth.signInWithPassword.mockResolvedValue({ error: { message: errorMessage } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    const signInButton = screen.getByText('Sign In');
    
    await act(async () => {
      signInButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });
  });

  it('handles sign out', async () => {
    mockSupabaseAuth.signOut.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    const signOutButton = screen.getByText('Sign Out');
    
    await act(async () => {
      signOutButton.click();
    });

    expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
  });

  it('handles password reset', async () => {
    mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    const resetButton = screen.getByText('Reset Password');
    
    await act(async () => {
      resetButton.click();
    });

    expect(mockSupabaseAuth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/update-password'),
      })
    );
  });

  it('handles password update', async () => {
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockSupabaseAuth.updateUser.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    const updateButton = screen.getByText('Update Password');
    
    await act(async () => {
      updateButton.click();
    });

    expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
      password: 'newpass',
    });
  });

  it('correctly identifies admin role', async () => {
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
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('admin');
      expect(screen.getByTestId('is-organizer')).toHaveTextContent('not-organizer');
      expect(screen.getByTestId('has-role')).toHaveTextContent('has-admin-role');
    });
  });

  it('correctly identifies organizer role', async () => {
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
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('not-admin');
      expect(screen.getByTestId('is-organizer')).toHaveTextContent('organizer');
      expect(screen.getByTestId('has-role')).toHaveTextContent('no-admin-role');
    });
  });

  it('cleans up subscription on unmount', () => {
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
