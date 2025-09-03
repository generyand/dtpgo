import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/auth/supabase-server'

// Protected admin routes that require authentication
const ADMIN_ROUTES = ['/admin', '/dashboard']

// Protected organizer routes that require authentication
const ORGANIZER_ROUTES = ['/organizer']

// Protected route patterns (using regex for dynamic routes)
const ADMIN_ROUTE_PATTERNS = [
  /^\/admin(\/.*)?$/,  // /admin and all sub-routes
  /^\/dashboard(\/.*)?$/, // /dashboard and all sub-routes
]

const ORGANIZER_ROUTE_PATTERNS = [
  /^\/organizer(\/.*)?$/,  // /organizer and all sub-routes
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
 * Check if the current path is an organizer route that requires authentication
 */
function isOrganizerRoute(pathname: string): boolean {
  // Check exact matches first
  if (ORGANIZER_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return true
  }
  
  // Check pattern matches
  return ORGANIZER_ROUTE_PATTERNS.some(pattern => pattern.test(pathname))
}

/**
 * Check if the current path is a protected route (admin or organizer)
 */
function isProtectedRoute(pathname: string): boolean {
  return isAdminRoute(pathname) || isOrganizerRoute(pathname)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes and API routes that don't need protection
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  // Skip auth checks for login page to prevent redirect loops
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Debug bypass: allow disabling auth checks entirely for admin routes
  if (process.env.DISABLE_AUTH === 'true') {
    console.warn('DISABLE_AUTH is enabled - skipping admin auth checks in middleware')
    return NextResponse.next()
  }

  // Validate Supabase env vars early to avoid redirect loops when misconfigured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars missing in middleware. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('error', 'configuration_error')
    const res = NextResponse.redirect(redirectUrl)
    res.headers.set('X-Auth-Reason', 'missing-supabase-env')
    return res
  }

  try {
    // Use our centralized Supabase middleware client
    const { supabase, response } = createSupabaseMiddlewareClient(request)

    // Get session and refresh if needed
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Middleware auth error:', error.message)
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      redirectUrl.searchParams.set('error', 'auth_error')
      const res = NextResponse.redirect(redirectUrl)
      res.headers.set('X-Auth-Reason', 'supabase-error')
      res.headers.set('X-Auth-Error', error.message)
      return res
    }

    if (!session?.user) {
      // Redirect to the unified login page
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      const res = NextResponse.redirect(redirectUrl)
      res.headers.set('X-Auth-Reason', 'no-session')
      return res
    }

    // Check if user has required role for protected routes
    const userRole = session.user.user_metadata?.role
    
    // Admin route access control
    if (isAdminRoute(pathname)) {
      if (userRole !== 'admin' && userRole !== 'organizer') {
        console.warn(`User ${session.user.email} attempted to access admin route without proper role`)
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('error', 'insufficient_permissions')
        redirectUrl.searchParams.set('message', 'Admin access required')
        const res = NextResponse.redirect(redirectUrl)
        res.headers.set('X-Auth-Reason', 'insufficient-role')
        return res
      }
    }
    
    // Organizer route access control
    if (isOrganizerRoute(pathname)) {
      if (userRole !== 'organizer' && userRole !== 'admin') {
        console.warn(`User ${session.user.email} attempted to access organizer route without proper role`)
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('error', 'insufficient_permissions')
        redirectUrl.searchParams.set('message', 'Organizer access required')
        const res = NextResponse.redirect(redirectUrl)
        res.headers.set('X-Auth-Reason', 'insufficient-role')
        return res
      }
    }

    // User is authenticated and authorized, continue with the updated response
    return response

  } catch (error) {
    console.error('Middleware exception:', error)

    // Redirect to the unified login page
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    redirectUrl.searchParams.set('error', 'middleware_error')
    const res = NextResponse.redirect(redirectUrl)
    res.headers.set('X-Auth-Reason', 'middleware-exception')
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory assets
     */
    '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
