# Platform Support Requests

Authenticated users can submit support requests from Platform surfaces. The first implemented entry point is the documentation footer CTA on `/docs`.

## Data model

- Table: `platform_support_requests`
- Migration: `supabase/migrations/20260628160000_create_platform_support_requests.sql`
- Columns:
  - `user_id` (required)
  - `organization_id` (optional; resolved server-side from membership context when available)
  - `product` (optional slug: `account`, `buildcore`, `forgecore`, `formcore`, `analyticscore`, `other`)
  - `subject`, `message` (required)
  - `source` (defaults to `docs`)
  - `status` (`open`, `in_progress`, `closed`)
  - timestamps

RLS is enabled. Inserts happen only through service-role server APIs.

## API

`POST /api/support/requests`

- Requires authenticated Supabase user (`Authorization: Bearer <access_token>`)
- Validates subject/message length and optional product
- Resolves `organization_id` from ZenformedCore membership context when Core is configured
- Inserts via `recordSupportRequest()` in `supportRequestRepository.server.ts`

## Docs footer flow

Component: `DocsSupportCta`

- Copy: “Can't find what you're looking for? Contact support and we'll help.”
- Logged-out users: redirect to `/login?returnTo=<current docs path>`
- Logged-in users: open `SupportRequestModal`
- Success toast: “Support request sent.”

Reusable UI for future pages:

- `SupportRequestModal`
- `SupportRequestSuccessToast`

## Verification

```sql
select id, user_id, organization_id, product, subject, source, status, created_at
from platform_support_requests
order by created_at desc
limit 20;
```

Local manual check:

1. Open `/docs` while signed out and click **Contact Support** → login redirect with `returnTo=/docs`
2. Sign in, return to `/docs`, click **Contact Support** → modal opens
3. Submit subject + message → toast appears and row is inserted in Supabase
