-- Staff-only access to orders.
--
-- Before this, any signed-in Supabase account could read and update every
-- booking. Supabase lets anyone sign up with the public anon key unless
-- sign-ups are switched off, so a stranger could create an account and read
-- customers' names, phones and addresses. Now only accounts listed in `staff`
-- can see or move orders.
--
-- Run once in the Supabase SQL editor (safe to re-run). Then add each staff
-- login (Authentication > Users) to the list, e.g.:
--   insert into staff (user_id, name)
--   select id, 'Front desk' from auth.users where email = 'frontdesk@example.com';
--
-- Also switch off public sign-ups: Authentication > Sign In / Providers >
-- "Allow new users to sign up" = off. Add staff from the dashboard instead.

create table if not exists staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);

alter table staff enable row level security;

-- A signed-in user may check whether they themselves are staff (the dashboard
-- uses this to show "not on the staff list"). Nobody can list other staff or
-- add themselves: there are no insert/update/delete policies.
drop policy if exists "staff can see own row" on staff;
create policy "staff can see own row"
  on staff for select
  to authenticated
  using (user_id = auth.uid());

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

revoke all on function is_staff() from public, anon;
grant execute on function is_staff() to authenticated;

drop policy if exists "authenticated staff can read bookings" on bookings;
drop policy if exists "authenticated staff can update booking status" on bookings;
drop policy if exists "staff can read bookings" on bookings;
drop policy if exists "staff can update booking status" on bookings;

create policy "staff can read bookings"
  on bookings for select
  to authenticated
  using (is_staff());

create policy "staff can update booking status"
  on bookings for update
  to authenticated
  using (is_staff())
  with check (is_staff());

-- Unchanged from the schema: staff may only move an order along (status).
revoke update on bookings from authenticated;
grant update (status, updated_at) on bookings to authenticated;

-- Keep everyone who already has a login working: every existing account is
-- added as staff. Remove any that shouldn't be there:
--   delete from staff where user_id = (select id from auth.users where email = '...');
insert into staff (user_id, name)
select id, coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1))
from auth.users
on conflict (user_id) do nothing;
