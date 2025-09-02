import type { User, Session } from '@supabase/supabase-js'

// User role types
export type UserRole = 'admin' | 'organizer'

// Extended user interface with role information
export interface UserWithRole extends User {
  user_metadata: {
    role?: UserRole
    full_name?: string
    avatar_url?: string
  } & User['user_metadata']
}

// Auth state interface
export interface AuthState {
  user: UserWithRole | null
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
  hasRole: (role: UserRole) => boolean
  isAdmin: () => boolean
  isOrganizer: () => boolean
  refreshSession: () => Promise<void>
}

// Session check result
export interface SessionCheckResult {
  user: UserWithRole | null
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

// Role-based permission helpers
export interface RolePermissions {
  canAccessAdminPanel: boolean
  canManageStudents: boolean
  canViewAnalytics: boolean
  canRegisterStudents: boolean
  canEditSettings: boolean
}

// Authentication action results
export interface AuthActionResult {
  success: boolean
  error?: string
  data?: unknown
}

// Password reset types
export interface PasswordResetData {
  email: string
  newPassword?: string
  token?: string
}
