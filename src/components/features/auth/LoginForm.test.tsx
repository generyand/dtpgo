import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '@/components/providers/AuthProvider';

// Mock the useRouter hook
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the useAuth hook
const mockSignIn = jest.fn();
const mockUseAuth = {
  user: null,
  session: null,
  loading: false,
  error: null,
  signIn: mockSignIn,
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  refreshSession: jest.fn(),
  updatePassword: jest.fn(),
  hasRole: jest.fn(() => false),
  isAdmin: jest.fn(() => false),
  isOrganizer: jest.fn(() => false),
};

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock Supabase auth methods
const mockSupabaseAuth = {
  getSession: jest.fn(),
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPasswordForEmail: jest.fn(),
  updateUser: jest.fn(),
  getUser: jest.fn(),
  refreshSession: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } }
  })),
};

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: mockSupabaseAuth,
  })),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('renders login form with all required fields', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format on form submission', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });

    // Test with empty email (should show validation error)
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty password', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput.type).toBe('password');

    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('calls signIn with correct credentials on form submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: null });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    }, { timeout: 3000 });
  });

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('displays error message when login fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockSignIn.mockResolvedValue({ error: errorMessage });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });

    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('Login Failed', {
      description: 'An unexpected error occurred. Please try again.',
    });
  });

  it('shows success message and redirects on successful login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: null });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(async () => {
      const { toast } = await import('sonner');
      expect(toast.success).toHaveBeenCalledWith('Login Successful', {
        description: 'Welcome back, Unknown Role!',
      });
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('navigates to password reset page when forgot password is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const forgotPasswordLink = screen.getByText(/forgot your password/i);
    await user.click(forgotPasswordLink);

    expect(mockPush).toHaveBeenCalledWith('/auth/reset-password');
  });

  it('disables form fields during submission', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('uses custom redirect URL when provided', async () => {
    const user = userEvent.setup();
    const customRedirect = '/custom-dashboard';
    mockSignIn.mockResolvedValue({ error: null });

    render(
      <TestWrapper>
        <LoginForm redirectTo={customRedirect} />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /signing in|sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(customRedirect);
    });
  });

  it('hides forgot password link when showPasswordReset is false', () => {
    render(
      <TestWrapper>
        <LoginForm showPasswordReset={false} />
      </TestWrapper>
    );

    expect(screen.queryByText(/forgot your password/i)).not.toBeInTheDocument();
  });
});
