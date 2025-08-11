import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
 * Middleware function to handle authentication for admin routes
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
    
    // On any error, redirect to login for security
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
