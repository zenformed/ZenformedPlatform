-- Platform support requests submitted by authenticated users.

create table if not exists public.platform_support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  organization_id uuid null,
  product text null,
  subject text not null,
  message text not null,
  source text not null default 'docs',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_support_requests_subject_check check (char_length(subject) > 0),
  constraint platform_support_requests_message_check check (char_length(message) > 0),
  constraint platform_support_requests_status_check
    check (status in ('open', 'in_progress', 'closed')),
  constraint platform_support_requests_source_check check (char_length(source) > 0)
);

create index if not exists platform_support_requests_user_id_idx
  on public.platform_support_requests (user_id);

create index if not exists platform_support_requests_status_created_at_idx
  on public.platform_support_requests (status, created_at desc);

create index if not exists platform_support_requests_source_created_at_idx
  on public.platform_support_requests (source, created_at desc);

create or replace function public.set_platform_support_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists platform_support_requests_set_updated_at on public.platform_support_requests;

create trigger platform_support_requests_set_updated_at
before update on public.platform_support_requests
for each row
execute function public.set_platform_support_requests_updated_at();

alter table public.platform_support_requests enable row level security;

comment on table public.platform_support_requests is
  'Authenticated platform support requests. Inserts use service-role server APIs.';
