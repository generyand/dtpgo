import { createBrowserClient } from '@supabase/ssr'

// Type definitions for Supabase
export type Database = Record<string, never>

/**
 * Creates a Supabase client for use in browser/client components
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
