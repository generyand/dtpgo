import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkIPWhitelist, getIPWhitelistConfig } from '@/lib/security/ip-whitelist'

// Protected admin routes that require authentication
const ADMIN_ROUTES = ['/admin', '/dashboard']

// Protected route patterns (using regex for dynamic routes)
const ADMIN_ROUTE_PATTERNS = [
  /^\/admin(\/.*)?$/,  // /admin and all sub-routes
  /^\/dashboard(\/.*)?$/, // /dashboard and all sub-routes
]

/**
 * Check if the current path is an admin route that requires authentication
 */
function isAdminRoute(pathname: string): boolean {
  // Check exact matches first
  if (ADMIN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return true
  }
  
  // Check pattern matches
  return ADMIN_ROUTE_PATTERNS.some(pattern => pattern.test(pathname))
}

/**
 * Middleware function to handle authentication and IP whitelisting for admin routes
 * 
 * Security layers (applied in order):
 * 1. IP Whitelist check (if enabled)
 * 2. Authentication check via Supabase session
 * 
 * Environment variables for IP whitelisting:
 * - IP_WHITELIST_ENABLED: Enable/disable IP whitelisting (default: false)
 * - IP_WHITELIST_IPS: Comma-separated list of allowed IPs
 * - IP_WHITELIST_RANGES: Comma-separated list of CIDR blocks or IP ranges
 * - IP_WHITELIST_ALLOW_LOCALHOST: Allow localhost access (default: true)
 * - IP_WHITELIST_ALLOW_PRIVATE: Allow private network access (default: true)
 */
export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const { pathname } = req.nextUrl
  
  // Skip middleware for public routes and API routes that don't need protection
  if (!isAdminRoute(pathname)) {
    return response
  }

  // Check IP whitelist for admin routes when enabled
  const ipWhitelistConfig = getIPWhitelistConfig()
  if (ipWhitelistConfig.enabled) {
    const ipCheck = checkIPWhitelist(req, ipWhitelistConfig)
    
    if (!ipCheck.allowed) {
      console.warn(`IP whitelist violation: ${ipCheck.reason}`)
      
      // Return 403 Forbidden for IP whitelist violations
      // This provides a clear security boundary without revealing auth details
      return new NextResponse(
        JSON.stringify({
          error: 'Access denied',
          message: 'Your IP address is not authorized to access this resource'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Blocked-Reason': 'ip-whitelist'
          }
        }
      )
    }
    
    // Log successful IP whitelist check for audit purposes
    console.log(`IP whitelist check passed for ${ipCheck.ip} accessing ${pathname}`)
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware auth error:', error)
      // Redirect to login on session error
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If no session exists, redirect to login
    if (!session || !session.user) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Optional: Add role-based access control here
    // You can check user roles from session.user.user_metadata or app_metadata
    // For now, any authenticated user can access admin routes
    
    // User is authenticated, allow access
    return response
    
  } catch (error) {
    console.error('Middleware error:', error)
    
    // Check if this is an IP whitelist related error
    const ipWhitelistConfig = getIPWhitelistConfig()
    if (ipWhitelistConfig.enabled) {
      try {
        const ipCheck = checkIPWhitelist(req, ipWhitelistConfig)
        if (!ipCheck.allowed) {
          // If IP whitelist is the issue, return 403 instead of redirect
          return new NextResponse(
            JSON.stringify({
              error: 'Access denied',
              message: 'Your IP address is not authorized to access this resource'
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                'X-Blocked-Reason': 'ip-whitelist-error'
              }
            }
          )
        }
      } catch (ipError) {
        console.error('IP whitelist check error:', ipError)
        // Fall through to auth redirect on IP check errors
      }
    }
    
    // On any non-IP-related error, redirect to login for security
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }
}

/**
 * Middleware configuration
 * Specify which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
