import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import { UserWithRole } from '@/lib/types/auth'
import { authenticateApiRequest } from '@/lib/auth/api-auth'

/**
 * Organizer-specific authentication result
 */
export interface OrganizerAuthResult {
  success: boolean
  user?: UserWithRole
  error?: string
  statusCode?: number
  isOrganizer?: boolean
  isAdmin?: boolean
  assignedEvents?: string[]
}

/**
 * Organizer session information
 */
export interface OrganizerSession {
  user: UserWithRole
  isOrganizer: boolean
  isAdmin: boolean
  assignedEvents: string[]
  permissions: {
    canScanAttendance: boolean
    canViewSessions: boolean
    canManageSessions: boolean
  }
}

/**
 * Authenticate organizer API requests
 */
export async function authenticateOrganizerRequest(
  request: NextRequest
): Promise<OrganizerAuthResult> {
  try {
    // Use existing API auth with organizer role
    const authResult = await authenticateApiRequest(request, {
      allowedRoles: ['admin', 'organizer'],
      requireAuth: true,
    })

    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error || 'Authentication failed',
        statusCode: authResult.statusCode || 401,
      }
    }

    const user = authResult.user
    const isOrganizer = user.user_metadata?.role === 'organizer'
    const isAdmin = user.user_metadata?.role === 'admin'

    // TODO: Get assigned events from database when Event model is implemented
    // For now, return empty array
    const assignedEvents: string[] = []

    return {
      success: true,
      user,
      isOrganizer,
      isAdmin,
      assignedEvents,
    }
  } catch (error) {
    console.error('Organizer auth error:', error)
    return {
      success: false,
      error: 'Internal authentication error',
      statusCode: 500,
    }
  }
}

/**
 * Get organizer session information
 */
export async function getOrganizerSession(): Promise<OrganizerSession | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    if (error || !authUser) {
      return null
    }

    const user = authUser as UserWithRole
    const isOrganizer = user.user_metadata?.role === 'organizer'
    const isAdmin = user.user_metadata?.role === 'admin'

    // TODO: Get assigned events from database when Event model is implemented
    const assignedEvents: string[] = []

    return {
      user,
      isOrganizer,
      isAdmin,
      assignedEvents,
      permissions: {
        canScanAttendance: isOrganizer || isAdmin,
        canViewSessions: isOrganizer || isAdmin,
        canManageSessions: isAdmin, // Only admins can manage sessions
      },
    }
  } catch (error) {
    console.error('Error getting organizer session:', error)
    return null
  }
}

/**
 * Check if user has organizer permissions
 */
export function hasOrganizerPermission(
  user: UserWithRole | null,
  permission: keyof OrganizerSession['permissions']
): boolean {
  if (!user) return false

  const isOrganizer = user.user_metadata?.role === 'organizer'
  const isAdmin = user.user_metadata?.role === 'admin'

  switch (permission) {
    case 'canScanAttendance':
      return isOrganizer || isAdmin
    case 'canViewSessions':
      return isOrganizer || isAdmin
    case 'canManageSessions':
      return isAdmin // Only admins can manage sessions
    default:
      return false
  }
}

/**
 * Validate organizer access to specific event
 */
export function validateOrganizerEventAccess(
  user: UserWithRole | null,
  eventId: string,
  assignedEvents: string[]
): boolean {
  if (!user) return false

  const isAdmin = user.user_metadata?.role === 'admin'
  
  // Admins have access to all events
  if (isAdmin) return true

  const isOrganizer = user.user_metadata?.role === 'organizer'
  
  // Organizers can only access assigned events
  if (isOrganizer) {
    return assignedEvents.includes(eventId)
  }

  return false
}

/**
 * Create organizer auth error response
 */
export function createOrganizerAuthErrorResponse(result: OrganizerAuthResult) {
  return Response.json(
    { 
      error: result.error || 'Organizer authentication failed',
      success: false 
    },
    { status: result.statusCode || 401 }
  )
}

/**
 * Organizer-only API route wrapper
 */
export function withOrganizerOnlyAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await authenticateOrganizerRequest(request)
    
    if (!authResult.success) {
      return createOrganizerAuthErrorResponse(authResult)
    }

    // Add organizer context to request if needed
    return handler(request, ...args)
  }
}

/**
 * Check if current user is organizer
 */
export function isCurrentUserOrganizer(user: UserWithRole | null): boolean {
  return user?.user_metadata?.role === 'organizer'
}

/**
 * Check if current user is admin
 */
export function isCurrentUserAdmin(user: UserWithRole | null): boolean {
  return user?.user_metadata?.role === 'admin'
}

/**
 * Get user role display name
 */
export function getUserRoleDisplayName(user: UserWithRole | null): string {
  if (!user) return 'Guest'
  
  const role = user.user_metadata?.role
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'organizer':
      return 'Event Organizer'
    default:
      return 'User'
  }
}
