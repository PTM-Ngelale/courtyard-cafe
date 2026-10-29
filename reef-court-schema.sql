-- Create streets/areas table for Reef Court Estate
create table estate_streets (
  id bigint primary key generated always as identity,
  street_name text not null unique,
  description text,
  created_at timestamp with time zone default now()
);

-- Create addresses table for Reef Court Estate
create table reef_court_addresses (
  id bigint primary key generated always as identity,
  street_id bigint not null,
  house_number text not null,
  resident_name text,
  created_at timestamp with time zone default now(),

  -- Composite unique constraint: street + house number
  constraint uk_street_house unique(street_id, house_number),
  constraint fk_street foreign key(street_id) references estate_streets(id) on delete restrict
);

-- Create bookings table (one row per delivery order)
create table bookings (
  id bigint primary key generated always as identity,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,              -- Paystack sends the receipt here
  street_id bigint not null,
  street_name text not null,                 -- copied at checkout, so staff never need the address tables
  house_number text not null,
  preferred_time timestamp with time zone not null,
  notes text,
  -- What was ordered, priced by the server from the menu at checkout:
  -- [{ id, name, group, quantity, price_naira }]
  items jsonb not null default '[]'::jsonb,
  subtotal_naira integer not null,
  delivery_fee_naira integer not null default 0,
  total_kobo bigint not null,                -- the amount Paystack must confirm
  -- awaiting_payment: checkout started, not paid yet (hidden from staff)
  -- confirmed: paid, waiting for the kitchen
  status text not null default 'awaiting_payment' check (status in
    ('awaiting_payment', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_reference text not null unique,    -- Paystack reference; one payment confirms one order
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  constraint fk_booking_street foreign key(street_id) references estate_streets(id),
  -- Foreign key to validate address exists
  constraint fk_booking_address foreign key(street_id, house_number)
    references reef_court_addresses(street_id, house_number)
);

-- Index for faster lookups
create index idx_bookings_status on bookings(status);
create index idx_bookings_preferred_time on bookings(preferred_time);
create index idx_bookings_street_house on bookings(street_id, house_number);

-- Enable realtime for bookings table so staff dashboard updates live
alter publication supabase_realtime add table bookings;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- customer_name / customer_phone / resident_name / house_number are personal
-- data. Only the server (service role, used exclusively in the API routes
-- under app/api/*, which bypasses RLS) may read or write estate_streets and
-- reef_court_addresses — the anon key must never see these tables directly,
-- or any visitor could dump the full resident/address list via the public
-- Supabase REST endpoint. No policies are defined for anon/authenticated on
-- either table, so with RLS enabled they are unreachable except via service
-- role.
-- ---------------------------------------------------------------------------

alter table estate_streets enable row level security;
alter table reef_court_addresses enable row level security;
alter table bookings enable row level security;

-- The staff dashboard reads/updates bookings directly from the browser using
-- the anon key, so it must be gated behind a signed-in Supabase Auth session
-- (create staff accounts in Authentication > Users). Anonymous visitors get
-- no access at all.
create policy "authenticated staff can read bookings"
  on bookings for select
  to authenticated
  using (true);

create policy "authenticated staff can update booking status"
  on bookings for update
  to authenticated
  using (true)
  with check (true);

-- Staff may only move an order along (status), never edit what was ordered,
-- the total or the payment details.
revoke update on bookings from authenticated;
grant update (status, updated_at) on bookings to authenticated;

-- No insert/delete policies for anon or authenticated: bookings are only
-- ever created by /api/checkout and confirmed by the Paystack return page or
-- webhook, all using the service role key.

-- Streets and houses: run reef-court-seed.sql next.
