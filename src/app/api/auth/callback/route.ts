import { createSupabaseServerClient } from '@/lib/auth/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Auth callback handler for Supabase authentication
 * This route handles the redirect after users sign in/up
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createSupabaseServerClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Get the user to check their role/permissions
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Determine redirect based on user role
          let redirectPath = next
          
          if (!redirectPath) {
            // Role-based redirect if no specific redirect provided
            const userRole = user.user_metadata?.role
            switch (userRole) {
              case 'admin':
                redirectPath = '/admin/dashboard'
                break
              case 'organizer':
                redirectPath = '/organizer/sessions'
                break
              default:
                redirectPath = '/admin/dashboard' // Default fallback
            }
          }
          
          const redirectUrl = new URL(redirectPath, origin)
          return NextResponse.redirect(redirectUrl)
        }
      } else {
        console.error('Auth callback error:', error)
        // Redirect to login with error
        const loginUrl = new URL('/auth/login', origin)
        loginUrl.searchParams.set('error', 'auth_callback_error')
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      // Redirect to login with error
      const loginUrl = new URL('/auth/login', origin)
      loginUrl.searchParams.set('error', 'auth_callback_exception')
      return NextResponse.redirect(loginUrl)
    }
  }

  // If no code parameter, redirect to login
  const loginUrl = new URL('/auth/login', origin)
  loginUrl.searchParams.set('error', 'missing_auth_code')
  return NextResponse.redirect(loginUrl)
}

/**
 * Handle POST requests (for potential future use)
 * Currently not needed for standard Supabase auth flow
 */
export async function POST() {
  return new Response('Method not allowed', { status: 405 })
}
