-- Run in Supabase SQL Editor (after phase4-6.sql).
alter table bookings add column if not exists inspiration_path text;
insert into storage.buckets (id, name, public) values ('inspiration', 'inspiration', false) on conflict (id) do nothing;
