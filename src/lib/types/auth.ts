import type { User, Session } from '@supabase/supabase-js'

// Auth state interface
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

// Login credentials interface
export interface LoginCredentials {
  email: string
  password: string
}

// Registration data interface
export interface RegisterCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

// Auth context interface
export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: string | null }>
  signUp: (credentials: RegisterCredentials) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
}

// Session check result
export interface SessionCheckResult {
  user: User | null
  session: Session | null
  error: string | null
}

// Auth error types
export type AuthErrorType = 
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'email_already_exists'
  | 'network_error'
  | 'unknown_error'

// Auth error interface
export interface AuthErrorDetail {
  type: AuthErrorType
  message: string
}

// Custom admin user type (if needed for frontend)
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}
