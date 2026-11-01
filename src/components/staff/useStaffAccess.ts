'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

export type Access = 'checking' | 'staff' | 'manager' | 'not-staff';

/**
 * Who is signed in and what they may see. `session` is undefined while it
 * loads, null when signed out. `access` comes from the caller's own row in
 * `staff` (RLS lets each account read only its own row). This only decides
 * what the page shows: the database and /api/staff enforce the real rules.
 */
export function useStaffAccess() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [access, setAccess] = useState<Access>('checking');

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setAccess('checking');
    (async () => {
      const withRole = await supabaseBrowser
        .from('staff')
        .select('user_id, role')
        .eq('user_id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (!withRole.error) {
        if (!withRole.data) setAccess('not-staff');
        else setAccess(withRole.data.role === 'manager' ? 'manager' : 'staff');
        return;
      }
      // Before reef-court-staff-roles.sql there's no role column; before
      // reef-court-staff.sql there's no staff table at all. Fall back so the
      // order board keeps working; the database still decides what's visible.
      const plain = await supabaseBrowser.from('staff').select('user_id').eq('user_id', userId).maybeSingle();
      if (cancelled) return;
      if (plain.error) setAccess('staff');
      else setAccess(plain.data ? 'staff' : 'not-staff');
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { session, access };
}

/** The signed-in user's access token, for calls to /api/staff. */
export async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabaseBrowser.auth.getSession();
  return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}
