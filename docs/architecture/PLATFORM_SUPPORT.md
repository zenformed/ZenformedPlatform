# Platform Support

Authenticated users can submit support requests from Platform surfaces. The first implemented entry point is the documentation footer CTA on `/docs`.

## System overview

Support uses a ticket + threaded conversation model:

| Layer | Table | Purpose |
|-------|-------|---------|
| Ticket | `platform_support_requests` | Subject, status, priority, assignment, lifecycle timestamps |
| Conversation | `platform_support_request_messages` | Ordered thread of customer, support, and system messages |

Migrations:

- `supabase/migrations/20260628160000_create_platform_support_requests.sql`
- `supabase/migrations/20260628170000_create_platform_support_request_messages.sql`
- `supabase/migrations/20260628180000_enrich_platform_support_requests.sql`

RLS is enabled on both tables. All database writes use service-role server APIs — React components never access Supabase directly.

## `platform_support_requests`

Ticket metadata:

| Column | Purpose |
|--------|---------|
| `id` | Ticket identifier |
| `user_id` | Customer who opened the ticket |
| `organization_id` | Optional org context resolved server-side |
| `product` | Optional related product slug |
| `subject` | Ticket subject line |
| `source` | Entry surface (`docs`, etc.) |
| `status` | Lifecycle state |
| `priority` | `low`, `normal`, `high`, `urgent` (default `normal`) |
| `assigned_to_user_id` | Optional staff assignee (future admin UI) |
| `last_customer_message_at` | Most recent customer reply timestamp |
| `last_support_message_at` | Most recent support reply timestamp |
| `closed_at` | When the ticket was closed (future close workflow) |
| `created_at`, `updated_at` | Audit timestamps |

## `platform_support_request_messages`

Conversation thread:

| Column | Purpose |
|--------|---------|
| `id` | Message identifier |
| `request_id` | Parent ticket FK |
| `sender_user_id` | Author user id |
| `sender_type` | `customer`, `support`, or `system` |
| `message` | Message body |
| `created_at` | Message timestamp |

## Request lifecycle

```
Open
  ↓
In Progress
  ↓
Waiting on Customer
  ↓
Closed
```

- **Open** — new ticket or customer replied while waiting
- **In Progress** — staff is actively working the ticket (future admin workflow)
- **Waiting on Customer** — support replied and is awaiting customer response (future admin workflow)
- **Closed** — resolved ticket (future admin workflow)

Current docs modal creates tickets in **Open** with priority **normal**.

## Repository layer

`src/platform/support/supportRequestRepository.server.ts` owns all database access.

| Method | Behavior |
|--------|----------|
| `createSupportRequest()` | Inserts ticket + first `customer` message; sets `last_customer_message_at = created_at` |
| `addSupportRequestMessage()` | Appends thread message; updates ticket timestamps/status |
| `getSupportRequest()` | Loads ticket metadata |
| `getSupportRequestMessages()` | Loads ordered conversation thread |

Side-effect rules (`supportRequestMappers.ts`):

- **Customer message** → update `last_customer_message_at`; if status is `waiting_on_customer`, set status to `open`
- **Support message** → update `last_support_message_at`
- **System message** → touch `updated_at` only

Validation is centralized in `supportRequestValidation.ts`. Row mapping lives in `supportRequestMappers.ts`.

## API

`POST /api/support/requests` (thin BFF route)

- Authenticates via Supabase bearer token
- Validates submission
- Resolves `organization_id` from membership context when available
- Calls `createSupportRequest()`

No frontend behavior changes: subject → ticket, message → first customer thread row.

## Docs footer flow

Component: `DocsSupportCta`

- Logged-out users → `/login?returnTo=<current docs path>`
- Logged-in users → `SupportRequestModal` → `POST /api/support/requests`
- Success toast: “Support request sent.”

Reusable UI: `SupportRequestModal`, `SupportRequestSuccessToast`

## Future extension points

Ready for later without schema redesign:

- Staff admin inbox (`assigned_to_user_id`, `priority`, status transitions)
- Customer ticket portal (`getSupportRequest`, `getSupportRequestMessages`, `addSupportRequestMessage`)
- Setting `closed_at` when status → `closed`
- Attachments (reference `message_id`)
- Email/notifications (subscribe to new messages via timestamps)
- SLA dashboards (`last_customer_message_at`, `last_support_message_at`)

## Verification SQL

Open tickets:

```sql
select id, subject, status, priority, last_customer_message_at, created_at
from platform_support_requests
where status = 'open'
order by created_at desc;
```

Tickets waiting on customer:

```sql
select id, subject, last_support_message_at, last_customer_message_at, updated_at
from platform_support_requests
where status = 'waiting_on_customer'
order by last_support_message_at desc nulls last;
```

Newest tickets:

```sql
select id, subject, status, priority, source, created_at
from platform_support_requests
order by created_at desc
limit 20;
```

Conversation thread:

```sql
select id, sender_type, sender_user_id, message, created_at
from platform_support_request_messages
where request_id = '<request-id>'
order by created_at asc;
```

Ticket + first message:

```sql
select
  r.id,
  r.subject,
  r.status,
  r.priority,
  r.last_customer_message_at,
  m.message,
  m.sender_type
from platform_support_requests r
join platform_support_request_messages m on m.request_id = r.id
order by r.created_at desc, m.created_at asc
limit 20;
```
