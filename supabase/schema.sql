-- Run this once in Supabase: SQL Editor > New query > paste > Run.
insert into storage.buckets (id, name, public) values ('client-photos', 'client-photos', false)
on conflict (id) do nothing;

create table if not exists public.assessments (
  id uuid primary key,
  delete_token_hash text not null,
  photo_paths text[] not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
-- Row level security on with NO policies: only the server's secret key can read or write.
alter table public.assessments enable row level security;
