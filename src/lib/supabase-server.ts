import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client for server-only code (API route handlers). Never
 * import this from a Client Component — the service role key bypasses RLS
 * and must not reach the browser bundle.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
