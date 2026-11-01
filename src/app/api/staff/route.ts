import { NextRequest, NextResponse } from 'next/server';
import {
  EMAIL_RE,
  MIN_PASSWORD,
  fail,
  isRole,
  managerCount,
  requireManager,
} from '@/lib/staff-admin';

/**
 * Manage staff (managers only; see src/lib/staff-admin.ts).
 *   GET     list staff
 *   POST    { name, email, password, role }      add someone
 *   PATCH   { user_id, role? , password? }        change role / set a new password
 *   DELETE  { user_id }                           remove someone (deletes their login)
 */

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ctx = await requireManager(req);
  if (ctx instanceof NextResponse) return ctx;

  const { data: rows, error } = await ctx.db
    .from('staff')
    .select('user_id, name, role, created_at')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('list staff failed', error);
    return fail(500, 'Could not load the staff list.');
  }

  // Emails and last sign-in live in Supabase Auth, not in the staff table.
  const { data: users, error: usersError } = await ctx.db.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) {
    console.error('list users failed', usersError);
    return fail(500, 'Could not load the staff list.');
  }
  const byId = new Map(users.users.map((u) => [u.id, u]));

  return NextResponse.json({
    me: ctx.userId,
    staff: rows.map((r) => ({
      user_id: r.user_id,
      name: r.name,
      role: r.role,
      email: byId.get(r.user_id)?.email ?? '',
      last_sign_in_at: byId.get(r.user_id)?.last_sign_in_at ?? null,
      added_at: r.created_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  const ctx = await requireManager(req);
  if (ctx instanceof NextResponse) return ctx;

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const role = isRole(body?.role) ? body.role : 'staff';

  if (!name || name.length > 60) return fail(400, 'Enter their name.');
  if (!EMAIL_RE.test(email) || email.length > 120) return fail(400, 'Enter a valid email.');
  if (password.length < MIN_PASSWORD) return fail(400, `The password needs at least ${MIN_PASSWORD} characters.`);

  const { data: created, error } = await ctx.db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !created.user) {
    const taken = /already|registered|exists/i.test(error?.message ?? '');
    if (!taken) console.error('create user failed', error);
    return fail(
      taken ? 409 : 500,
      taken ? 'That email already has a login. Remove it first or use another email.' : 'Could not add them. Try again.'
    );
  }

  const { error: insertError } = await ctx.db
    .from('staff')
    .insert({ user_id: created.user.id, name, role });
  if (insertError) {
    console.error('insert staff failed', insertError);
    // Don't leave a login that isn't on the staff list.
    await ctx.db.auth.admin.deleteUser(created.user.id);
    return fail(500, 'Could not add them. Try again.');
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireManager(req);
  if (ctx instanceof NextResponse) return ctx;

  const body = await req.json().catch(() => null);
  const userId = typeof body?.user_id === 'string' ? body.user_id : '';
  if (!userId) return fail(400, 'Choose someone.');

  const { data: target } = await ctx.db.from('staff').select('role').eq('user_id', userId).maybeSingle();
  if (!target) return fail(404, "They're not on the staff list.");

  if (body.role !== undefined) {
    if (!isRole(body.role)) return fail(400, 'Choose a role.');
    if (target.role === 'manager' && body.role === 'staff' && (await managerCount(ctx.db)) <= 1) {
      return fail(400, "There has to be at least one manager.");
    }
    const { error } = await ctx.db.from('staff').update({ role: body.role }).eq('user_id', userId);
    if (error) {
      console.error('update role failed', error);
      return fail(500, 'Could not change their role. Try again.');
    }
  }

  if (body.password !== undefined) {
    if (typeof body.password !== 'string' || body.password.length < MIN_PASSWORD) {
      return fail(400, `The password needs at least ${MIN_PASSWORD} characters.`);
    }
    const { error } = await ctx.db.auth.admin.updateUserById(userId, { password: body.password });
    if (error) {
      console.error('set password failed', error);
      return fail(500, 'Could not set the password. Try again.');
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireManager(req);
  if (ctx instanceof NextResponse) return ctx;

  const body = await req.json().catch(() => null);
  const userId = typeof body?.user_id === 'string' ? body.user_id : '';
  if (!userId) return fail(400, 'Choose someone.');
  if (userId === ctx.userId) return fail(400, "You can't remove yourself. Ask another manager.");

  const { data: target } = await ctx.db.from('staff').select('role').eq('user_id', userId).maybeSingle();
  if (!target) return fail(404, "They're not on the staff list.");
  if (target.role === 'manager' && (await managerCount(ctx.db)) <= 1) {
    return fail(400, 'There has to be at least one manager.');
  }

  // Deleting the login also removes their staff row (on delete cascade).
  const { error } = await ctx.db.auth.admin.deleteUser(userId);
  if (error) {
    console.error('delete user failed', error);
    return fail(500, 'Could not remove them. Try again.');
  }
  return NextResponse.json({ ok: true });
}
