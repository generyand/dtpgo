import { createSupabaseBrowserClient } from './supabase'
// import { prisma } from '../db/client' // Remove prisma client import
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  SessionCheckResult,
  AuthErrorDetail,
  UserWithRole
} from '../types/auth'
import type { AuthError, AuthChangeEvent, Session } from '@supabase/supabase-js'

/**
 * Maps Supabase auth errors to our custom error types
 */
export function mapAuthError(error: AuthError | Error | null): AuthErrorDetail | null {
  if (!error) return null

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return { type: 'invalid_credentials', message: 'Invalid email or password' }
  }
  
  if (message.includes('user not found')) {
    return { type: 'user_not_found', message: 'No account found with this email' }
  }
  
  if (message.includes('email not confirmed')) {
    return { type: 'email_not_confirmed', message: 'Please check your email and confirm your account' }
  }
  
  if (message.includes('password') && message.includes('weak')) {
    return { type: 'weak_password', message: 'Password must be at least 6 characters long' }
  }
  
  if (message.includes('already registered') || message.includes('already exists')) {
    return { type: 'email_already_exists', message: 'An account with this email already exists' }
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return { type: 'network_error', message: 'Network error. Please check your connection.' }
  }

  return { type: 'unknown_error', message: error.message || 'An unexpected error occurred' }
}

/**
 * Sign in with email and password
 */
export async function signInWithCredentials(credentials: LoginCredentials): Promise<{ error: string | null; user?: UserWithRole }> {
  const supabase = createSupabaseBrowserClient();
  try {
    // Check for admin user via API route
    if (credentials.email.endsWith('@example.com')) {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Admin login failed' };
      }

      return { error: null, user: data.user };
    }

    // Fallback to Supabase auth for non-admin users
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      const mappedError = mapAuthError(error);
      return { error: mappedError?.message || error.message };
    }

    return { error: null };
  } catch (error) {
    const mappedError = mapAuthError(error as Error)
    return { error: mappedError?.message || 'An unexpected error occurred' }
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithCredentials(credentials: RegisterCredentials): Promise<{ error: string | null }> {
  const supabase = createSupabaseBrowserClient();
  try {
    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
        },
      },
    })

    if (error) {
      const mappedError = mapAuthError(error)
      return { error: mappedError?.message || error.message }
    }

    return { error: null }
  } catch (error) {
    const mappedError = mapAuthError(error as Error)
    return { error: mappedError?.message || 'An unexpected error occurred' }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut()
}

/**
 * Reset password for the given email
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseBrowserClient();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      const mappedError = mapAuthError(error)
      return { error: mappedError?.message || error.message }
    }

    return { error: null }
  } catch (error) {
    const mappedError = mapAuthError(error as Error)
    return { error: mappedError?.message || 'An unexpected error occurred' }
  }
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<SessionCheckResult> {
  const supabase = createSupabaseBrowserClient();
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      const mappedError = mapAuthError(error)
      return {
        user: null,
        session: null,
        error: mappedError?.message || error.message
      }
    }

    return {
      user: session?.user || null,
      session: session,
      error: null
    }
  } catch (error) {
    const mappedError = mapAuthError(error as Error)
    return {
      user: null,
      session: null,
      error: mappedError?.message || 'Failed to get session'
    }
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = createSupabaseBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(session: Session | null): boolean {
  return !!(session?.user && session?.access_token)
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  const supabase = createSupabaseBrowserClient();
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Cookie management utilities for server-side session handling
 */
export const cookieUtils = {
  /**
   * Get session cookie name
   */
  getSessionCookieName(): string {
    return 'supabase-auth-token'
  },

  /**
   * Create cookie options for session storage
   */
  getCookieOptions() {
    return {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    }
  },
}
