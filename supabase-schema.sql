-- ============================================================
-- IWS Operator Portal — Supabase Schema
-- Standalone database, locked-down RLS
-- ============================================================

-- ── USER ROLES ──────────────────────────────────────────────
-- Controls who can edit pricing vs read-only
create table if not exists user_roles (
  email text primary key,
  role  text not null default 'operator'
  -- 'owner' = can edit pricing (you/admin only)
  -- 'operator' = read-only access to pricing
);

alter table user_roles enable row level security;

-- Users can only read their own role
create policy "users can read own role"
  on user_roles for select
  using (auth.jwt()->>'email' = email);

-- Only service_role (backend) can insert/update/delete roles
-- No policy for insert/update/delete = blocked for anon/authenticated

-- ── PRICING PERIODS ─────────────────────────────────────────
create table if not exists pricing_periods (
  id          bigint primary key,
  start_date  text not null,
  end_date    text not null,
  price_per_bbl numeric(10,2) not null default 0,
  notes       text default '',
  sort_order  int default 0,
  updated_at  timestamptz default now()
);

alter table pricing_periods enable row level security;

-- Everyone authenticated can READ pricing
create policy "authenticated can read pricing"
  on pricing_periods for select
  to authenticated
  using (true);

-- Only owners can write pricing
create policy "owners can insert pricing"
  on pricing_periods for insert
  to authenticated
  with check (
    exists (
      select 1 from user_roles
      where email = auth.jwt()->>'email'
      and role = 'owner'
    )
  );

create policy "owners can update pricing"
  on pricing_periods for update
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt()->>'email'
      and role = 'owner'
    )
  );

create policy "owners can delete pricing"
  on pricing_periods for delete
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt()->>'email'
      and role = 'owner'
    )
  );

-- ── SEED YOUR ADMIN ─────────────────────────────────────────
-- Replace with your actual email
-- Run this AFTER creating your auth user in the dashboard
insert into user_roles (email, role) values
  ('christian@water.energy', 'owner')
on conflict (email) do nothing;

-- ── ADD OPERATORS ───────────────────────────────────────────
-- Add each operator who should see pricing:
-- insert into user_roles (email, role) values ('operator@company.com', 'operator');
