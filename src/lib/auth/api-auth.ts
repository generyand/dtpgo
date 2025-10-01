import { NextRequest } from 'next/server'
import { createSupabaseApiClient } from '@/lib/auth/supabase-server'
import { UserRole, UserWithRole } from '@/lib/types/auth'
import { hasRole, hasPermission, getRoleErrorMessage } from '@/lib/utils/role-utils'

/**
 * API Authentication result
 */
export interface ApiAuthResult {
  success: boolean
  user?: UserWithRole
  error?: string
  statusCode?: number
}

/**
 * API Authorization options
 */
export interface ApiAuthOptions {
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  requiredPermission?: string
  requireAuth?: boolean
}

/**
 * Authenticate and authorize API requests
 */
export async function authenticateApiRequest(
  request: NextRequest,
  options: ApiAuthOptions = {}
): Promise<ApiAuthResult> {
  const {
    requiredRole,
    allowedRoles,
    requiredPermission,
    requireAuth = true,
  } = options

  try {
    // Get Supabase client for API routes
    const supabase = createSupabaseApiClient(request)

    // Get authenticated user from request (secure method)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return {
        success: false,
        error: 'Authentication error: ' + authError.message,
        statusCode: 401,
      }
    }

    // Check if authentication is required
    if (requireAuth && !authUser) {
      return {
        success: false,
        error: 'Authentication required',
        statusCode: 401,
      }
    }

    // If no authentication required and no user, allow access
    if (!requireAuth && !authUser) {
      return { success: true }
    }

    const user = authUser as UserWithRole

    // Check specific required role
    if (requiredRole && !hasRole(user, requiredRole)) {
      return {
        success: false,
        error: getRoleErrorMessage(requiredRole, user?.user_metadata?.role || null),
        statusCode: 403,
      }
    }

    // Check allowed roles list
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some(role => hasRole(user, role))
      if (!hasAllowedRole) {
        return {
          success: false,
          error: 'Insufficient permissions for this operation',
          statusCode: 403,
        }
      }
    }

    // Check required permission
    if (requiredPermission && !hasPermission(user, requiredPermission as keyof import('@/lib/types/auth').RolePermissions)) {
      return {
        success: false,
        error: `Permission required: ${requiredPermission}`,
        statusCode: 403,
      }
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    console.error('API auth error:', error)
    return {
      success: false,
      error: 'Internal authentication error',
      statusCode: 500,
    }
  }
}

/**
 * Create API auth middleware function
 */
export function createApiAuthMiddleware(options: ApiAuthOptions = {}) {
  return async (request: NextRequest) => {
    return await authenticateApiRequest(request, options)
  }
}

/**
 * Helper function to create auth error response
 */
export function createAuthErrorResponse(result: ApiAuthResult) {
  return Response.json(
    { 
      error: result.error || 'Authentication failed',
      success: false 
    },
    { status: result.statusCode || 401 }
  )
}

/**
 * Admin-only API authentication
 */
export async function authenticateAdminApi(request: NextRequest): Promise<ApiAuthResult> {
  return await authenticateApiRequest(request, {
    requiredRole: 'admin',
    requireAuth: true,
  })
}

/**
 * Organizer or Admin API authentication
 */
export async function authenticateOrganizerApi(request: NextRequest): Promise<ApiAuthResult> {
  return await authenticateApiRequest(request, {
    allowedRoles: ['admin', 'organizer'],
    requireAuth: true,
  })
}

/**
 * Permission-based API authentication
 */
export async function authenticatePermissionApi(
  request: NextRequest,
  permission: string
): Promise<ApiAuthResult> {
  return await authenticateApiRequest(request, {
    requiredPermission: permission,
    requireAuth: true,
  })
}

/**
 * HOC for API route protection
 */
export function withApiAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>,
  options: ApiAuthOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await authenticateApiRequest(request, options)
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult)
    }

    // Add user to request context if needed
    return handler(request, ...args)
  }
}

/**
 * Admin-only API route wrapper
 */
export function withAdminAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return withApiAuth(handler, { requiredRole: 'admin' })
}

/**
 * Organizer or Admin API route wrapper
 */
export function withOrganizerAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return withApiAuth(handler, { allowedRoles: ['admin', 'organizer'] })
}

/**
 * Permission-based API route wrapper
 */
export function withPermissionAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>,
  permission: string
) {
  return withApiAuth(handler, { requiredPermission: permission })
}
