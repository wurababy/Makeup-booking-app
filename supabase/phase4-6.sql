-- Run in Supabase SQL Editor (after schema.sql). Bookings, looks, availability settings.
create table if not exists categories (id serial primary key, name text unique not null, sort int not null default 0);
create table if not exists looks (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
  category text not null references categories(name) on update cascade,
  description text not null default '', price integer not null check (price >= 0),
  minutes integer not null check (minutes between 15 and 480), photo_url text,
  active boolean not null default true, created_at timestamptz not null default now());
create table if not exists settings (
  id int primary key default 1 check (id = 1), open_time text not null default '09:00', close_time text not null default '18:00',
  step_minutes int not null default 30, buffer_minutes int not null default 30,
  work_days int[] not null default '{1,2,3,4,5,6}', deposit integer not null default 15000,
  lead_days int not null default 1, max_days int not null default 90);
insert into settings (id) values (1) on conflict do nothing;
create table if not exists blocked_dates (day date primary key);
create table if not exists extra_dates (day date primary key);
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(), ref text unique not null,
  look_id uuid references looks(id) on delete set null, look_name text not null,
  price integer not null, deposit integer not null,
  start_at timestamptz not null, end_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','expired','needs_refund')),
  hold_expires_at timestamptz, name text not null, phone text not null, email text not null,
  occasion text not null, notes text, balance_paid boolean not null default false, paystack_ref text,
  created_at timestamptz not null default now(), check (end_at > start_at),
  -- The database itself refuses overlapping appointments (including the buffer):
  constraint no_overlap exclude using gist (tstzrange(start_at, end_at) with &&) where (status in ('pending','confirmed')));
-- Only the server (secret key) may touch these tables:
alter table categories enable row level security; alter table looks enable row level security;
alter table settings enable row level security; alter table blocked_dates enable row level security;
alter table extra_dates enable row level security; alter table bookings enable row level security;
-- Public bucket for your portfolio photos (marketing images only):
insert into storage.buckets (id, name, public) values ('look-photos', 'look-photos', true) on conflict (id) do nothing;
