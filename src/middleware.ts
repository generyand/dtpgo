import { createServerClient, type CookieOptions } from '@supabase/ssr'
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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const { pathname } = request.nextUrl

  // Skip middleware for public routes and API routes that don't need protection
  if (!isAdminRoute(pathname)) {
    return response
  }

  // Debug bypass: allow disabling auth checks entirely for admin routes
  if (process.env.DISABLE_AUTH === 'true') {
    console.warn('DISABLE_AUTH is enabled - skipping admin auth checks in middleware')
    return response
  }

  // Simple Auth Fallback: allow access if our simple auth cookie is present
  const simpleAuthCookie = request.cookies.get('APP_AUTH')?.value
  if (simpleAuthCookie) {
    console.log('[Auth] Simple auth cookie detected, allowing access to', pathname)
    return response
  }

  // Validate Supabase env vars early to avoid redirect loops when misconfigured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars missing in middleware. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    // Add debug header to help in network tab
    const dbg = NextResponse.next()
    dbg.headers.set('X-Auth-Reason', 'missing-supabase-env')
    return dbg
  }

  // IP whitelist checks removed

  try {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({ request: { headers: request.headers } })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Middleware auth error:', error)
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      const res = NextResponse.redirect(redirectUrl)
      res.headers.set('X-Auth-Reason', 'supabase-error')
      return res
    }

    if (!session || !session.user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      const res = NextResponse.redirect(redirectUrl)
      res.headers.set('X-Auth-Reason', 'no-session')
      try {
        const names = request.cookies.getAll().map(c => c.name).join(',')
        res.headers.set('X-Auth-Cookies', names || 'none')
      } catch {}
      return res
    }

    // User is authenticated, allow access
    return response

  } catch (error) {
    console.error('Middleware error:', error)

    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    const res = NextResponse.redirect(redirectUrl)
    res.headers.set('X-Auth-Reason', 'middleware-exception')
    return res
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
