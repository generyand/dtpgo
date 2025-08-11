'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthContextType, AuthState, LoginCredentials, RegisterCredentials } from '@/lib/types/auth'
import {
  signInWithCredentials,
  signUpWithCredentials,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  getCurrentSession,
  onAuthStateChange,
} from '@/lib/auth/utils'

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// AuthProvider component props
interface AuthProviderProps {
  children: React.ReactNode
}

// AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  // Initialize auth state on component mount
  useEffect(() => {
    let mounted = true

    // Get initial session
    getCurrentSession().then((result) => {
      if (mounted) {
        setAuthState({
          user: result.user,
          session: result.session,
          loading: false,
          error: result.error,
        })
      }
    })

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange((event, session) => {
      if (mounted) {
        setAuthState((prev) => ({
          ...prev,
          user: session?.user || null,
          session: session,
          loading: false,
          error: null,
        }))
      }
    })

    // Cleanup function
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign in function
  const signIn = async (credentials: LoginCredentials): Promise<{ error: string | null }> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await signInWithCredentials(credentials)
      
      if (result.error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: result.error,
        }))
      } else if (result.user) {
        // Manually set auth state for admin user from API response
        const adminUser = {
            id: result.user.id,
            email: result.user.email,
            aud: 'authenticated',
            role: 'admin',
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString(),
        };
        setAuthState({
            user: adminUser,
            session: {
                access_token: 'admin-token',
                user: adminUser,
                refresh_token: 'admin-refresh-token',
                expires_in: 3600,
                token_type: 'bearer',
            },
            loading: false,
            error: null,
        });
      }
      
      return { error: result.error }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      return { error: errorMessage }
    }
  }

  // Sign up function
  const signUp = async (credentials: RegisterCredentials): Promise<{ error: string | null }> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await signUpWithCredentials(credentials)
      
      if (result.error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: result.error,
        }))
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      return { error: errorMessage }
    }
  }

  // Sign out function
  const signOut = async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    
    try {
        if (authState.user?.role === 'admin') {
            setAuthState({ user: null, session: null, loading: false, error: null });
        } else {
            await authSignOut()
        }
      // The auth state will be updated by the onAuthStateChange listener
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }
  }

  // Reset password function
  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await authResetPassword(email)
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: result.error,
      }))
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      return { error: errorMessage }
    }
  }

  // Context value
  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
