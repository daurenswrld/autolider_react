create table if not exists public.autolider_state (
  id integer primary key check (id = 1),
  data jsonb not null,
  version bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.autolider_state enable row level security;
revoke all on public.autolider_state from anon, authenticated;
grant select, insert, update on public.autolider_state to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('autolider-images', 'autolider-images', true, 4194304, array['image/webp'])
on conflict (id) do nothing;
-- No anonymous upload policy. Only the backend service role writes objects.
