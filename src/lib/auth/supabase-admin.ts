import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client using the Service Role key.
 * DO NOT expose this client to the browser. Use only in server-side contexts (API routes).
 */
export function createSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables for service client')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}


