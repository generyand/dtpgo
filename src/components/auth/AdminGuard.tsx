'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  )
}

// Unauthorized component
function UnauthorizedMessage() {
  const router = useRouter()

  const handleLoginRedirect = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You need to be authenticated to access this admin area.
        </p>
        <button
          onClick={handleLoginRedirect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}

// Error component
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

// AdminGuard component props
interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ComponentType
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * AdminGuard component that protects admin routes and shows appropriate states
 */
export function AdminGuard({ 
  children, 
  fallback: FallbackComponent,
  redirectTo = '/auth/login',
  requireAuth = true
}: AdminGuardProps) {
  const { user, session, loading, error } = useAuth()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasSimpleAuth, setHasSimpleAuth] = useState(false)

  useEffect(() => {
    // Add a small delay to ensure auth context is properly initialized
    const timer = setTimeout(() => {
      setIsInitialized(true)
      // Detect simple auth cookie on client
      try {
        if (typeof document !== 'undefined') {
          const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('APP_AUTH='))
          setHasSimpleAuth(hasCookie)
        }
      } catch {}
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Handle retry for auth errors
  const handleRetry = () => {
    window.location.reload()
  }

  // Handle redirect for unauthorized access (skip when simple auth is active)
  useEffect(() => {
    if (isInitialized && !loading && requireAuth && !hasSimpleAuth && !user && !error) {
      const currentPath = window.location.pathname
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      router.push(redirectUrl)
    }
  }, [isInitialized, loading, user, error, requireAuth, redirectTo, router, hasSimpleAuth])

  // Show loading state while auth is being checked
  if (!isInitialized || loading) {
    return <LoadingSpinner />
  }

  // Show error state if there's an authentication error
  if (error) {
    return <ErrorMessage error={error} onRetry={handleRetry} />
  }

  // If simple auth is present, allow access
  if (hasSimpleAuth) {
    return <>{children}</>
  }

  // Show unauthorized state if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    if (FallbackComponent) {
      return <FallbackComponent />
    }
    return <UnauthorizedMessage />
  }

  // Show unauthorized state if user exists but no valid session
  if (requireAuth && user && !session) {
    if (FallbackComponent) {
      return <FallbackComponent />
    }
    return <UnauthorizedMessage />
  }

  // User is authenticated, render children
  return <>{children}</>
}

/**
 * Higher-order component version of AdminGuard for easier usage
 */
export function withAdminGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AdminGuardProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <AdminGuard {...options}>
        <Component {...props} />
      </AdminGuard>
    )
  }

  WrappedComponent.displayName = `withAdminGuard(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default AdminGuard
