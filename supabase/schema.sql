-- ---------------------------------------------------------------------------
-- Supabase schema — PILOT (equipments).
--
-- Run this in the Supabase SQL editor to bootstrap the first entity. It is a
-- starting point, not the full model: `deliveries`, `receipts`,
-- `notifications`, `fuel_pricing`, `tank_refuelings`, and pricing all still
-- need tables. Migrate one entity at a time — wire `equipments` end to end
-- (read + write via lib/supabase.ts, replacing the seed in lib/data/equipments.ts)
-- before adding the next.
--
-- Column names mirror the `Equipment` / `CustomerAccount` shapes in
-- lib/data/types.ts so the mapping to the app stays 1:1.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Fuel classification (matches EquipmentClass in the app).
do $$ begin
  create type equipment_class as enum ('On-road', 'Off-road');
exception when duplicate_object then null; end $$;

-- Customers ------------------------------------------------------------------
-- `auth_user_id` links a row to a Supabase Auth user once auth is wired up
-- (the login screens don't authenticate yet). RLS policies below key off it.
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name         text not null,
  email        text,
  logo         text,
  location     text,
  created_at   timestamptz not null default now()
);

-- Equipments -----------------------------------------------------------------
create table if not exists public.equipments (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers (id) on delete cascade,
  name             text not null,
  classification   equipment_class not null,
  subtype          text not null,
  max_tank_capacity integer not null check (max_tank_capacity > 0),
  quantity         integer not null default 1 check (quantity > 0),
  unit_numbers     text[] not null default '{}',
  notes            text,
  image            text,
  location         text not null,
  created_at       timestamptz not null default now()
);

create index if not exists equipments_customer_id_idx
  on public.equipments (customer_id);

-- Row-level security ---------------------------------------------------------
-- Enabled up front so nothing is world-readable by accident. The policies
-- below assume each customer row is tied to the signed-in auth user; admins
-- would get a broader policy (e.g. a role claim) when auth is built out.
alter table public.customers  enable row level security;
alter table public.equipments enable row level security;

drop policy if exists "customers self access" on public.customers;
create policy "customers self access" on public.customers
  for all using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

drop policy if exists "equipments owned by customer" on public.equipments;
create policy "equipments owned by customer" on public.equipments
  for all using (
    exists (
      select 1 from public.customers c
      where c.id = equipments.customer_id and c.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.customers c
      where c.id = equipments.customer_id and c.auth_user_id = auth.uid()
    )
  );
