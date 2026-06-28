-- Thread support request conversations into platform_support_request_messages.

create table if not exists public.platform_support_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.platform_support_requests (id) on delete cascade,
  sender_user_id uuid not null,
  sender_type text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint platform_support_request_messages_message_check check (char_length(message) > 0),
  constraint platform_support_request_messages_sender_type_check
    check (sender_type in ('customer', 'support', 'system'))
);

create index if not exists platform_support_request_messages_request_created_at_idx
  on public.platform_support_request_messages (request_id, created_at asc);

create index if not exists platform_support_request_messages_sender_user_id_idx
  on public.platform_support_request_messages (sender_user_id);

insert into public.platform_support_request_messages (
  request_id,
  sender_user_id,
  sender_type,
  message,
  created_at
)
select
  id,
  user_id,
  'customer',
  message,
  created_at
from public.platform_support_requests
where char_length(message) > 0;

alter table public.platform_support_requests
  drop constraint if exists platform_support_requests_message_check;

alter table public.platform_support_requests
  drop column if exists message;

alter table public.platform_support_request_messages enable row level security;

comment on table public.platform_support_request_messages is
  'Support request conversation thread messages. Inserts use service-role server APIs.';

comment on column public.platform_support_request_messages.sender_type is
  'Message author role: customer, support, or system.';
