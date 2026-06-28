-- Enrich support tickets for help desk lifecycle tracking.

alter table public.platform_support_requests
  add column if not exists assigned_to_user_id uuid null,
  add column if not exists priority text not null default 'normal',
  add column if not exists last_customer_message_at timestamptz null,
  add column if not exists last_support_message_at timestamptz null,
  add column if not exists closed_at timestamptz null;

alter table public.platform_support_requests
  drop constraint if exists platform_support_requests_status_check;

alter table public.platform_support_requests
  add constraint platform_support_requests_status_check
    check (status in ('open', 'in_progress', 'waiting_on_customer', 'closed'));

alter table public.platform_support_requests
  drop constraint if exists platform_support_requests_priority_check;

alter table public.platform_support_requests
  add constraint platform_support_requests_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent'));

create index if not exists platform_support_requests_assigned_to_user_id_idx
  on public.platform_support_requests (assigned_to_user_id)
  where assigned_to_user_id is not null;

create index if not exists platform_support_requests_waiting_on_customer_idx
  on public.platform_support_requests (last_customer_message_at desc)
  where status = 'waiting_on_customer';

create index if not exists platform_support_requests_priority_status_idx
  on public.platform_support_requests (priority, status, created_at desc);

comment on column public.platform_support_requests.assigned_to_user_id is
  'Optional staff user assigned to handle the ticket.';

comment on column public.platform_support_requests.priority is
  'Ticket priority: low, normal, high, or urgent.';

comment on column public.platform_support_requests.last_customer_message_at is
  'Timestamp of the most recent customer-authored thread message.';

comment on column public.platform_support_requests.last_support_message_at is
  'Timestamp of the most recent support-authored thread message.';

comment on column public.platform_support_requests.closed_at is
  'Timestamp when the ticket was closed.';

-- Backfill customer message timestamps for tickets created before enrichment.
update public.platform_support_requests r
set last_customer_message_at = first_message.created_at
from (
  select distinct on (request_id)
    request_id,
    created_at
  from public.platform_support_request_messages
  where sender_type = 'customer'
  order by request_id, created_at asc
) as first_message
where r.id = first_message.request_id
  and r.last_customer_message_at is null;
