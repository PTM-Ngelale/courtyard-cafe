import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

/**
 * Server-only helpers for the Manage staff page. Every request must carry the
 * caller's Supabase access token (Authorization: Bearer ...); the token is
 * checked with Supabase and the caller must be listed in `staff` with
 * role = 'manager'. Uses the service role, so never import this from a
 * Client Component.
 */

export type StaffRole = 'staff' | 'manager';

export interface ManagerContext {
  userId: string;
  db: ReturnType<typeof createServiceClient>;
}

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

/** The signed-in manager making this request, or a ready-made error response. */
export async function requireManager(req: NextRequest): Promise<ManagerContext | NextResponse> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return fail(401, 'Sign in again.');

  const db = createServiceClient();
  const { data: auth, error: authError } = await db.auth.getUser(token);
  if (authError || !auth.user) return fail(401, 'Sign in again.');

  const { data: me, error } = await db
    .from('staff')
    .select('role')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (error) {
    console.error('staff role lookup failed', error);
    return fail(500, 'Could not check your account. Try again.');
  }
  if (me?.role !== 'manager') return fail(403, 'Only managers can manage staff.');

  return { userId: auth.user.id, db };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export function isRole(v: unknown): v is StaffRole {
  return v === 'staff' || v === 'manager';
}

/** How many managers there are, so the last one can't be removed or demoted. */
export async function managerCount(db: ManagerContext['db']) {
  const { count, error } = await db
    .from('staff')
    .select('user_id', { count: 'exact', head: true })
    .eq('role', 'manager');
  if (error) throw error;
  return count ?? 0;
}
