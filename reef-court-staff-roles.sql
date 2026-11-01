-- Staff roles: "manager" can open Manage staff (add, remove, reset passwords);
-- "staff" can only handle orders. Run once in the Supabase SQL editor after
-- reef-court-staff.sql (safe to re-run).

alter table staff
  add column if not exists role text not null default 'staff';

alter table staff drop constraint if exists staff_role_check;
alter table staff
  add constraint staff_role_check check (role in ('staff', 'manager'));

-- Signed-in staff can already read their own row (policy "staff can see own
-- row"), so the dashboard can see its own role. Nobody can change a role
-- from the browser: there is still no update policy on this table. The
-- Manage staff page changes roles through the server, which checks that the
-- caller is a manager first.

-- Make the owner a manager. Add the manager from the Manage staff page
-- afterwards (or run the same update with their email).
update staff set role = 'manager'
where user_id = (select id from auth.users where email = 'retronano908@gmail.com');

-- Check: should list the owner with role = manager.
select s.name, u.email, s.role
from staff s join auth.users u on u.id = s.user_id
order by s.role, s.name;
