import { createClient } from '@supabase/supabase-js';

/**
 * Anon-key client for Client Components. RLS restricts what this can see —
 * only `authenticated` (signed-in staff) can read/update `bookings`; the
 * address tables aren't reachable with this key at all (see reef-court-schema.sql).
 */
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
