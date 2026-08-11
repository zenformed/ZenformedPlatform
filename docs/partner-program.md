# Zenformed Partner Programs

Status: architecture and implementation plan only  
Implementation status: Slice 7A approval/invitation code implemented; claim/grant integration not started  
Database status: migrations 00052–00056 applied and verified by owner  
Last updated: 2026-08-11

## Purpose

Build a reusable Partner Programs system whose first configured program is expected to be
"ZenCore Founders." A person may apply without a Zenformed account. An administrator may review
and approve the application, send a secure invitation, and allow the person to sign in or register
through the existing Zenformed authentication flow. After activation, the participant receives
configured, time-limited application access without creating or altering a Stripe subscription.

This document is the implementation record and review checkpoint. It must be updated during every
implementation slice with the exact files changed, tests run, database queries supplied, and any
departure from the approved architecture.

## Non-goals and protected production contracts

Partner Programs must not replace or reinterpret existing production systems. The following are
protected:

- Supabase Auth registration, email verification, password login, Google OAuth, sessions, and JWTs.
- The `profiles` lifecycle and existing `auth.users` trigger.
- Personal organization creation and `platform_organization_members` ownership/membership.
- Stripe Checkout, customer mapping, webhook handling, subscription synchronization, cancellation,
  reactivation, upgrades, downgrades, trials, and replay protection.
- `platform_subscriptions` as the Stripe billing ledger.
- Existing Stripe-to-`platform_app_entitlements` synchronization.
- Existing paid, seeded, manual, or historical access records.
- Platform dashboard and application-launch behavior.
- BuildCore authorization, membership, capabilities, plans, and seats as consumers of Core access.

The implementation must never fabricate a Stripe subscription, cancel or edit a paid subscription,
replace an account or organization, or require an application to understand Partner Programs.

## Confirmed current architecture

The checked-out pre-Partner baseline was verified before this document was created:

| Repository | Branch | HEAD at discovery | Working tree before planning |
| --- | --- | --- | --- |
| ZenformedPlatform | `main` | `ff51b9f4ceca50e9dd9b0bd78c96f197f94ad11a` | clean |
| ZenformedCore | `main` | `ab997f2a45f02e74b43b30ad7f8c611af421a707` | clean |
| BuildCore | `main` | `299c3a61ea5d54697190585cf8037ab76bcf8652` | clean |
| zenformed-core-package | `main` | `ec5bfec3b613db0a30c6504e783cd3b419e15243` | clean |

`ForgeCore` exists in the workspace but was access-denied during discovery. No claims about its
internal implementation should be made until it can be inspected. The Platform/Core integration
design does not require ForgeCore-specific promotion behavior.

Relevant confirmed behavior:

- Platform password registration calls the shared `signUpWithPassword` helper and supplies
  `bootstrap_default_organization` metadata.
- `public.handle_new_user()` creates `profiles`; when bootstrap metadata is present, it also creates
  a personal `platform_organizations` row and active owner membership.
- Google OAuth uses the existing callback and the idempotent Core default-organization endpoint.
- `platform_subscriptions` is the authoritative Stripe billing ledger.
- Stripe synchronization upserts the existing organization/application row in
  `platform_app_entitlements`, which is the access mirror.
- Platform dashboard ownership is derived from Core entitlement responses and granting entitlement
  statuses, not directly from Stripe.
- BuildCore relays entitlement and organization access questions to Core.
- Plan normalization currently recognizes `starter`, `growth`, and `pro`; BuildCore includes 3, 10,
  and 25 seats respectively.
- Existing seed paths can create entitlement rows from profile fields without creating subscription
  rows. The Partner implementation must not classify or delete those rows as invalid.

## Architectural decision

Partner benefits will be separate, attributable, time-bound access grants. They will not be stored
in `platform_subscriptions` and will not overwrite `platform_app_entitlements`.

The existing entitlement and the currently active Partner grant will be inputs to one Core
effective-access calculation:

```text
existing base entitlement ----\
                               +--> effective entitlement --> existing consumers
active Partner grants --------/
```

This is the only expected change to a protected access boundary. It is necessary because the
existing entitlement mirror is unique per organization and application. Overwriting that row would
allow Stripe webhooks, expiration, or revocation to destroy or downgrade unrelated paid access.

All callers must receive a consistent effective plan. Platform visibility, app entry, capability
resolution, and seat resolution must not calculate different answers.

## Effective-access rules

Plan strength is based on existing catalog plans:

```text
pro > growth > starter > no granting access
```

Only a grant whose start time has arrived, expiration time has not passed, and status is active may
participate. Expiration must be enforced at read time; a scheduled cleanup process must not be a
security dependency.

| Base access | Partner access | Effective during grant | After grant |
| --- | --- | --- | --- |
| Pro | Growth | Pro | Pro |
| Starter | Growth | Growth | Starter |
| None | Growth | Growth | None |
| Growth | Growth | Growth | Growth |
| Canceled/expired | Growth | Growth | None after Partner expiration |

Revocation or expiration removes only the Partner-derived input. It must never update or delete the
base entitlement or subscription.

## Reusable domain model

The exact schema proposal below is ready for review. It is not executable SQL and no migration has
been created. The model deliberately keeps application review, invitation delivery, participation,
and access-grant lifecycles separate so one state does not have to impersonate another.

### `platform_partner_programs`

Reusable program configuration.

| Column | Proposed type/rule | Purpose |
| --- | --- | --- |
| `id` | UUID primary key | Stable program identity. |
| `slug` | Text, normalized lowercase, unique | Public route key such as `zencore-founders`. |
| `internal_name` | Non-empty text | Admin-facing name. |
| `public_name` | Non-empty text | Public page heading. |
| `public_description` | Text | Public program copy. |
| `status` | `draft`, `open`, `closed`, or `archived` | Controls application availability and administration. |
| `applications_open_at` | Nullable timestamp | Optional scheduled opening. |
| `applications_close_at` | Nullable timestamp | Optional scheduled closing. |
| `terms_version` | Non-empty text | Exact terms/consent version recorded on submission. |
| `application_schema_version` | Non-empty text, default `1` | Version copied into application validation context. |
| `application_schema_json` | JSONB object containing a `fields` array | Reusable public application question definition. |
| `created_by` | Nullable FK to `auth.users`, set null on user deletion | Staff audit actor. |
| `created_at` | Timestamp, default now | Audit time. |
| `updated_at` | Timestamp, default now | Audit time maintained by the Core service. |

Constraints:

- Slug must equal its trimmed lowercase value and match a conservative URL-safe pattern.
- When both window timestamps exist, close must be later than open.
- Application schema must be an object whose `fields` member is an array; Core validates each field
  definition before it is published or used for submission validation.
- `open` status is necessary but not sufficient: the current time must also be inside the optional
  application window.
- Archival hides a program from normal administration but does not delete applications or grants.

### `platform_partner_program_benefits`

Explicit application and plan benefits for a program.

| Column | Proposed type/rule | Purpose |
| --- | --- | --- |
| `id` | UUID primary key | Stable benefit identity. |
| `program_id` | FK to programs, cascade on program deletion | Owning program. |
| `app_id` | FK to `platform_apps`, restrict deletion | Existing application being granted. |
| `plan_slug` | `starter`, `growth`, or `pro` | Existing normalized catalog plan. |
| `duration_months` | Positive integer, bounded | Calendar-month duration beginning at activation. |
| `created_at` | Timestamp, default now | Audit time. |
| `updated_at` | Timestamp, default now | Audit time. |

Constraints:

- Unique `(program_id, app_id)`; a program grants at most one configured plan per application.
- Recommended bound is 1 through 120 months.
- Founders will use explicit Growth rows with `duration_months = 6` for each approved application.
- There is no "all apps" wildcard. The admin action may select all currently registered apps, but
  Core persists an explicit benefit row for each one.
- Program benefits become immutable after the first invitation is issued. A materially different
  offer should be a new program/version, preventing accepted grants from changing retroactively.

### `platform_partner_applications`

Unauthenticated public submissions. This table contains application and review data only; it does
not grant access and does not require or create an account.

| Column | Proposed type/rule | Purpose |
| --- | --- | --- |
| `id` | UUID primary key | Application receipt identity. |
| `program_id` | FK to programs, restrict deletion | Program applied to. |
| `email` | Non-empty text | Applicant contact and later claim identity. |
| `first_name` | Non-empty text | Applicant identity. |
| `last_name` | Non-empty text | Applicant identity. |
| `company_name` | Nullable text | Business identity. |
| `answers_json` | JSONB object, default `{}` | Versioned program-specific answers without per-program schema changes. |
| `application_schema_version` | Non-empty text | Program form version used for this submission. |
| `application_schema_snapshot_json` | JSONB object with `fields` array | Immutable question-definition snapshot used for this submission. |
| `consented_terms_version` | Non-empty text | Terms version accepted during submission. |
| `status` | `submitted`, `in_review`, `approved`, `rejected`, or `withdrawn` | Review lifecycle only. |
| `review_notes` | Nullable text | Internal staff notes, never returned publicly. |
| `reviewed_by` | Nullable FK to `auth.users`, set null | Staff reviewer. |
| `reviewed_at` | Nullable timestamp | Review audit time. |
| `created_at` | Timestamp, default now | Submission time. |
| `updated_at` | Timestamp, default now | Audit time. |

Constraints and privacy:

- Recommended unique index on `(program_id, lower(trim(email)))` to prevent duplicate applications
  for the same program. A later business requirement for reapplication should be implemented as an
  explicit resubmission workflow, not silent duplicates.
- Email is normalized by Core before persistence and compared case-insensitively.
- `answers_json` must be a JSON object and is validated against the program form definition in Core.
- Public submission returns an opaque receipt and the same response for duplicate email cases so it
  does not disclose account or prior-application existence.
- Application records are retained for audit; rejection does not delete them.

### `platform_partner_invitations`

Single logical invitation per approved application. Resending rotates the token on the same record
instead of generating multiple simultaneously valid invitations.

| Column | Proposed type/rule | Purpose |
| --- | --- | --- |
| `id` | UUID primary key | Invitation identity. |
| `application_id` | FK to applications, unique, cascade | Exactly one logical invitation per application. |
| `email` | Non-empty text | Snapshot of approved recipient email. |
| `token_hash` | SHA-256 hex text, unique | Hash-only single-use claim secret. |
| `status` | `pending`, `claimed`, `revoked`, or `expired` | Invitation lifecycle. |
| `expires_at` | Required timestamp | Claim deadline. |
| `approved_by` | Nullable FK to `auth.users`, set null | Staff approval actor. |
| `sent_at` | Nullable timestamp | Most recent successful send attempt. |
| `send_attempt_count` | Nonnegative integer, default zero | Delivery diagnostics. |
| `claimed_at` | Nullable timestamp | Successful claim time. |
| `claimed_by` | Nullable FK to `auth.users`, set null | Verified claimant. |
| `revoked_at` | Nullable timestamp | Revocation time. |
| `revoked_by` | Nullable FK to `auth.users`, set null | Staff revocation actor. |
| `created_at` | Timestamp, default now | Audit time. |
| `updated_at` | Timestamp, default now | Audit time. |

Invariants:

- Raw invitation tokens are returned once to the email service and never stored or logged.
- Resend atomically replaces `token_hash`, extends `expires_at`, increments the attempt count, and
  invalidates the previous link.
- A claim requires `pending`, an unexpired timestamp, a matching token hash, an authenticated user,
  and case-insensitive equality between the verified Supabase email and invitation email.
- Approval and invitation issuance are idempotent. Retrying approval reuses this row.

### `platform_partner_participations`

The activated relationship between an approved application, verified user, and eligible
organization.

| Column | Proposed type/rule | Purpose |
| --- | --- | --- |
| `id` | UUID primary key | Participation identity and grant provenance. |
| `program_id` | FK to programs, restrict deletion | Program snapshot relationship. |
| `application_id` | FK to applications, unique, restrict deletion | One activation per application. |
| `user_id` | FK to `auth.users`, restrict deletion | Verified participant. |
| `organization_id` | FK to `platform_organizations`, restrict deletion | Organization receiving benefits. |
| `status` | `active` or `revoked` | Administrative participation state. Expiration is derived from grants. |
| `activated_at` | Timestamp, default now | Benefit start anchor. |
| `revoked_at` | Nullable timestamp | Participation revocation time. |
| `revoked_by` | Nullable FK to `auth.users`, set null | Staff revocation actor. |
| `revocation_reason` | Nullable text | Required by service when revoked. |
| `created_at` | Timestamp, default now | Audit time. |
| `updated_at` | Timestamp, default now | Audit time. |

Invariants:

- Claim service verifies the user has an active `platform_organization_members` row for the target
  organization. It never creates or replaces membership.
- Activation, participation creation, grant creation, and invitation consumption occur atomically.
- The application email links identity before activation; `user_id` is not populated on the public
  application.
- Revocation changes this participation and its grants only.

### `platform_partner_access_grants`

One immutable benefit snapshot per participation and application. These rows are additive inputs to
Core access resolution; they are not subscription or entitlement-mirror rows.

| Column | Proposed type/rule | Purpose |
| --- | --- | --- |
| `id` | UUID primary key | Grant identity exposed as internal provenance. |
| `participation_id` | FK to participations, cascade | Owning participation. |
| `organization_id` | FK to organizations, restrict deletion | Access subject. |
| `app_id` | FK to `platform_apps`, restrict deletion | Granted application. |
| `plan_slug` | `starter`, `growth`, or `pro` | Granted catalog plan snapshot. |
| `effective_from` | Required timestamp | Inclusive access start. |
| `effective_to` | Required timestamp | Exclusive access end, calculated at activation. |
| `status` | `active` or `revoked` | Explicit administrative state; scheduled/expired are derived from timestamps. |
| `revoked_at` | Nullable timestamp | Grant revocation time. |
| `revoked_by` | Nullable FK to `auth.users`, set null | Staff actor. |
| `revocation_reason` | Nullable text | Audit reason. |
| `created_at` | Timestamp, default now | Audit time. |
| `updated_at` | Timestamp, default now | Audit time. |

Constraints and indexes:

- Unique `(participation_id, app_id)` makes activation retries harmless.
- `effective_to > effective_from` is mandatory.
- Active-resolution index on `(organization_id, app_id, status, effective_from, effective_to)`.
- Participation index supports revocation and audit lookup.
- Rows are not rewritten when catalog prices, subscription state, or program configuration changes.
- Expired rows remain `active` historically but fail the time-window predicate. Admin display derives
  `scheduled`, `active`, `expired`, or `revoked` without relying on a cleanup job.

## Database security and ownership proposal

All six Partner tables will have Row Level Security enabled. The initial migration will create no
`anon` or `authenticated` browser policies. This follows the existing server-owned table pattern:

- Public applications call a rate-limited Platform relay and Core public endpoint.
- Core validates and writes with its existing server-side service-role client.
- Invitation validation returns only non-sensitive public display data.
- Claims require a valid Bearer JWT and are executed by Core after verified-email and membership
  checks.
- Admin reads and mutations require existing `platform_staff_users` authorization.
- `platform_viewer` may read applications/programs; only `platform_admin` and `platform_owner` may
  configure programs, approve/reject, send/revoke invitations, or revoke participation.

No table is readable or writable directly from the browser. No new auth role, JWT claim, or Supabase
Auth hook is proposed.

## Transaction boundaries

Multi-row state transitions must not be implemented as independent best-effort HTTP writes.
Recommended database functions, callable only by `service_role`, are:

- Approve application and create/reuse its invitation.
- Claim invitation, create participation, snapshot benefits into grants, and consume invitation.
- Revoke participation and its still-active grants.

These functions are internal atomicity primitives, not new authorization boundaries. Core performs
authentication, staff authorization, token hashing/comparison, verified-email checks, and
organization-membership checks before calling them. Function inputs still include expected current
states so concurrent/replayed calls fail closed or return the existing idempotent result.

## Data intentionally not stored

- No Stripe customer, price, subscription, checkout, invoice, or billing status.
- No password, provider token, session, JWT, or raw invitation token.
- No replacement `subscription_status` or `license_tier` on profiles.
- No copied organization membership or ownership role.
- No wildcard granting future applications.
- No mutable "previous entitlement" value that would need restoration later.

## User journeys

### Public application

1. Visitor opens a public program page.
2. Platform loads the public program definition and configured questions from Core.
3. Visitor submits without authentication.
4. Core validates the open window, input, consent, and duplicate policy.
5. Core stores the application and returns a non-sensitive receipt.

Public submission endpoints require rate limiting, bot protection consistent with existing public
forms, input length limits, and responses that do not reveal whether an email has an account.

### Admin review and approval

1. Existing Platform admin authorization protects the review UI and Core endpoints.
2. Admin reviews the application and selects approve or reject.
3. Approval atomically records the decision and creates or reuses one active invitation.
4. Existing Core transactional email delivery sends the invitation.
5. Resend and revoke are explicit, audited, idempotent actions.

Approval does not grant access. Access begins only after a verified user claims the invitation and
an eligible organization is resolved.

### Existing-account activation

1. Recipient opens the claim link.
2. Platform validates the invitation without consuming it.
3. Recipient signs in normally.
4. Core requires the authenticated verified email to match the invitation email.
5. If the user belongs to multiple eligible organizations, the user selects the target organization.
6. Core atomically creates the participation and grants, then consumes the invitation.

### New-account activation

1. Platform preserves a short-lived Partner claim intent.
2. Recipient uses the existing registration page and Supabase verification flow.
3. Existing profile, organization, and owner-membership bootstrap runs unchanged.
4. After normal login/callback, Platform resumes the claim.
5. Core verifies identity and creates the participation and grants for the resolved organization.

No Partner-specific account type, password flow, session, or organization is introduced.

## Proposed implementation slices and checkpoints

Each slice stops for review. Paths below are proposed and do not indicate that files already exist.

### Slice 0: plan and documentation

Scope: this document only.

Acceptance:

- Architecture, safety boundaries, proposed schema, file plan, tests, queries, and rollback strategy
  are documented.
- No application code or migration exists.

### Slice 1: pure effective-access policy

Repository: ZenformedCore.

Proposed additions:

- `src/partnerPrograms/partnerPlanPrecedence.ts`
- `src/partnerPrograms/partnerAccessGrantTypes.ts`
- Unit tests colocated with the policy.

Potential existing files requiring narrow modification after review:

- `src/platformAppMirrorResolution.ts`
- `src/CapabilityEntitlementResolver.ts`
- `src/entitlementSnapshot.ts`

This slice should begin with pure functions and tests. Database reads must not be added until the
precedence contract is approved.

### Slice 2: schema SQL supplied for owner execution

Repository: ZenformedCore SQL migration directory, matching the repository's current convention.

Deliverables:

- One additive migration file containing only new Partner tables, constraints, indexes, comments,
  and RLS setup.
- A separate block of verification queries in this document.
- A separate rollback plan in this document.

The repository migration may be authored after approval, but Codex will not execute it against
Supabase. No later slice that requires the tables begins until the owner confirms successful
execution and verification.

### Slice 3: Core program and application services

Proposed additions under `ZenformedCore/src/partnerPrograms/`:

- Program repository and validation
- Public application service
- Admin review service
- HTTP handlers and route registration following existing Core conventions
- Service and HTTP tests

Existing Core admin authorization must be reused. No new administrator identity system is allowed.

### Slice 4: approval invitation and email

Proposed Core additions:

- Secure token generation/hash/validation
- Idempotent invitation issue, resend, and revoke services
- Partner acceptance email template registered with existing communication/email infrastructure

Potential existing files requiring modification:

- `src/communications/communicationTemplateRegistry.ts`
- `src/http/server.ts`

The existing `zenformedEmailService` transport should be reused, not duplicated.

### Slice 5: Platform public and admin pages

Proposed Platform additions:

- `app/partners/[programSlug]/page.tsx`
- Public application presentation components and Core relay route
- Admin programs/application queue pages and components under the existing admin structure
- Core API clients following current relay conventions

Exact paths will be reconciled with the current routing and component patterns immediately before
implementation. Existing global navigation will be changed only if explicitly approved.

### Slice 6: normal-auth claim and activation

Proposed Platform additions:

- `app/partners/claim/page.tsx`
- Claim-intent storage/resume utility
- Core relay endpoints for invitation validation and activation

Potential narrow modifications:

- Existing registration/login navigation to preserve an approved return destination.
- Existing OAuth completion path to resume a validated Partner intent after normal organization
  bootstrap.

No Supabase Auth behavior or callback exchange may be replaced.

### Slice 7: grant-backed effective entitlements

Core reads active grants and combines them with the existing base entitlement. Both entitlement
snapshots and capability/seat payloads use the same winning plan. Existing Stripe synchronization
continues to write only its current tables.

Expected existing Core touch points:

- `src/http/platformSessionProfile.ts`
- `src/platformAppMirrorResolution.ts` or a new composition layer immediately above it
- `src/CapabilityEntitlementResolver.ts`
- Related batch entitlement and capability tests

Platform and BuildCore should require no Partner-specific access logic. Any proposed app-specific
change triggers a design review before proceeding.

### Slice 8: revocation, expiry visibility, and end-to-end verification

Add audited admin revocation, expiry reporting, delivery/claim diagnostics, and complete manual
verification. A background status-maintenance job is optional; read-time expiration remains
authoritative.

## Expected untouched systems

Unless later evidence proves a narrow change unavoidable and it is separately approved, these files
and systems should remain untouched:

- Stripe checkout and all `src/stripe/*` synchronization services.
- `sql/00042_platform_subscriptions.sql` and existing applied migrations.
- The existing registration trigger behavior.
- Shared password and Google sign-in helpers.
- BuildCore billing and authorization implementation.
- Existing application-specific database schemas.
- Existing entitlement rows and subscription rows.

## Release-blocking tests

- Paid Pro plus Partner Growth resolves to Pro before, during, and after the Partner period.
- Paid Starter plus Partner Growth resolves to Growth, then returns to Starter.
- No base access plus Partner Growth resolves to Growth, then to no access.
- Revoking a Partner grant removes only Partner access.
- Canceling a subscription does not revoke an independent Partner grant.
- Stripe webhook replay neither deletes nor downgrades Partner access.
- Expiration is enforced without running a scheduled job.
- Duplicate approval, resend, and claim requests do not duplicate participation or grants.
- A different authenticated email cannot claim an invitation.
- A new participant uses the normal profile and organization bootstrap exactly once.
- Platform visibility, application entry, plan, capabilities, and seats agree on the effective plan.
- Explicit program benefits do not expand when a new application is registered later.
- Admin endpoints reject non-admin users; public responses do not disclose account existence.

## Owner-run SQL protocol

For every database step, Codex will provide three clearly separated sections:

1. Migration SQL to run, in exact order.
2. Read-only verification queries and expected results.
3. Rollback SQL or recovery procedure, with data-loss warnings where applicable.

Codex will not execute production Supabase changes. Work depending on a schema change pauses until
the owner confirms the migration and verification results.

### Slice 2B migration query

Run the complete contents of:

- `ZenformedCore/sql/00052_platform_partner_programs.sql`

The file is one additive transaction-sized schema unit. It creates six Partner tables, constraints,
indexes, RLS enablement, removes direct `anon`/`authenticated` privileges, and grants table access
to the existing `service_role`. It does not alter any existing table.

Do not run only selected fragments. If Supabase reports an error, stop and return the complete error
before retrying or editing anything in the SQL editor.

#### Contaminated database baseline discovered

The first execution attempt stopped because an abandoned prior implementation already contained
`platform_partner_programs` with an incompatible schema. Database diagnostics confirmed these old
tables and exact test-only row counts:

- `platform_partner_programs`: 1
- `platform_partner_program_app_benefits`: 1
- `platform_partner_program_applications`: 1
- `platform_partner_program_memberships`: 1
- `platform_partner_program_consents`: 5
- `platform_partner_program_audit_events`: 8

The owner identified the sole application as the prior test using `djhindu17@aol.com`. The old
tables are not part of the restored repository baseline. The new migration was hardened by removing
`if not exists`; any future collision now fails at the first statement instead of mixing schemas.

Before running the guarded cleanup below, save/export the diagnostic JSON if historical retention is
desired. The transaction deliberately does not delete the Supabase user, profile, organization,
membership, entitlement, subscription, or any non-Partner record.

```sql
begin;

do $$
declare
  v_programs bigint;
  v_benefits bigint;
  v_applications bigint;
  v_memberships bigint;
  v_consents bigint;
  v_audit_events bigint;
  v_other_emails bigint;
begin
  select count(*) into v_programs
  from public.platform_partner_programs;

  select count(*) into v_benefits
  from public.platform_partner_program_app_benefits;

  select count(*) into v_applications
  from public.platform_partner_program_applications;

  select count(*) into v_memberships
  from public.platform_partner_program_memberships;

  select count(*) into v_consents
  from public.platform_partner_program_consents;

  select count(*) into v_audit_events
  from public.platform_partner_program_audit_events;

  select count(*) into v_other_emails
  from public.platform_partner_program_applications
  where lower(btrim(email_normalized)) <> 'djhindu17@aol.com';

  if v_programs <> 1
    or v_benefits <> 1
    or v_applications <> 1
    or v_memberships <> 1
    or v_consents <> 5
    or v_audit_events <> 8
    or v_other_emails <> 0 then
    raise exception
      'Partner cleanup guard failed. Counts: programs=%, benefits=%, applications=%, memberships=%, consents=%, audit_events=%, other_emails=%',
      v_programs,
      v_benefits,
      v_applications,
      v_memberships,
      v_consents,
      v_audit_events,
      v_other_emails;
  end if;
end;
$$;

-- Dependency order; intentionally no CASCADE. Unknown external dependencies stop the transaction.
drop table public.platform_partner_program_audit_events;
drop table public.platform_partner_program_consents;
drop table public.platform_partner_program_memberships;
drop table public.platform_partner_program_applications;
drop table public.platform_partner_program_app_benefits;
drop table public.platform_partner_programs;

commit;
```

Expected result: success. If the guard or a dependency fails, PostgreSQL rolls the transaction back;
stop and return the complete error. After success, run this confirmation before the new migration:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'platform_partner_%'
order by table_name;
```

Expected result: 0 rows. Only then run `00052_platform_partner_programs.sql` from the beginning.

### Slice 2B read-only verification queries

Run these only after the migration reports success.

```sql
-- 1. All six tables must exist.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'platform_partner_programs',
    'platform_partner_program_benefits',
    'platform_partner_applications',
    'platform_partner_invitations',
    'platform_partner_participations',
    'platform_partner_access_grants'
  )
order by table_name;

-- Expected: exactly 6 rows.

-- 2. RLS must be enabled on every Partner table.
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relname like 'platform_partner_%'
  and relkind = 'r'
order by relname;

-- Expected: exactly 6 rows and every rls_enabled value is true.

-- 3. No browser-facing Partner policies should exist in this slice.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename like 'platform_partner_%'
order by tablename, policyname;

-- Expected: 0 rows.

-- 4. Browser roles must have no direct table privileges.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name like 'platform_partner_%'
  and grantee in ('anon', 'authenticated')
order by grantee, table_name, privilege_type;

-- Expected: 0 rows.

-- 5. The migration must not have created any Partner data.
select
  (select count(*) from public.platform_partner_programs) as programs,
  (select count(*) from public.platform_partner_program_benefits) as benefits,
  (select count(*) from public.platform_partner_applications) as applications,
  (select count(*) from public.platform_partner_invitations) as invitations,
  (select count(*) from public.platform_partner_participations) as participations,
  (select count(*) from public.platform_partner_access_grants) as grants;

-- Expected: every count is 0.

-- 6. Existing protected tables still exist; this is a presence check only.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'platform_organizations',
    'platform_organization_members',
    'platform_apps',
    'platform_app_entitlements',
    'platform_subscriptions'
  )
order by table_name;

-- Expected: the same protected tables present before this migration.
```

### Slice 2B rollback query

Rollback is destructive to Partner data and must be used only before Partner applications or grants
contain records, or after an explicit data-retention decision. It does not touch protected tables.

```sql
begin;

drop table if exists public.platform_partner_access_grants;
drop table if exists public.platform_partner_participations;
drop table if exists public.platform_partner_invitations;
drop table if exists public.platform_partner_applications;
drop table if exists public.platform_partner_program_benefits;
drop table if exists public.platform_partner_programs;

commit;
```

Before any rollback after data exists, export all six Partner tables and obtain separate approval.

## Rollback strategy

- Before activation is enabled, Partner tables and UI can be removed without touching existing
  billing or entitlement records.
- After grants exist, disable Partner reads first so Core returns base entitlements only.
- Preserve application, invitation, participation, and grant records for audit unless deletion is
  explicitly authorized.
- Never roll back by modifying `platform_subscriptions` or reconstructing
  `platform_app_entitlements`.
- Every migration must be additive and must document whether its rollback is metadata-only or
  destructive.

## Change log

### 2026-08-11 — Slice 7A atomic approval and invitation delivery

Added in ZenformedCore:

- `sql/00056_approve_partner_application_invitation.sql` — service-role-only atomic application
  approval and single-invitation create/rotation function.
- `src/partnerPrograms/partnerInvitationService.ts` — cryptographically random 256-bit raw token,
  SHA-256 hash persistence, seven-day expiration, atomic RPC call, accept-link construction, existing
  transactional email delivery, and successful-send timestamp persistence.
- `src/partnerPrograms/partnerInvitationService.test.ts` — verifies only a 64-character SHA-256 hash
  reaches the RPC, the raw-token link reaches email but the hash does not, and viewers are denied.
- `src/email/templates/partnerProgramInvitationEmail.ts` — Partner approval invitation HTML/text
  using the existing Core email sender.

Modified:

- ZenformedCore `src/http/partnerProgramsAdminHttp.ts` — approved decisions use the new atomic
  invitation service; in-review/rejected decisions retain the existing review-only path.
- ZenformedCore `package.json` — adds invitation tests to the automatic Partner pretest suite.
- ZenformedPlatform `src/presentation/components/Admin/AdminPartnerApplicationDetailPage.tsx` —
  reports whether approval email was sent or whether an invitation exists but delivery failed.

Database execution:

1. Run the complete contents of ZenformedCore
   `sql/00056_approve_partner_application_invitation.sql` in the Supabase SQL editor.
2. Run this read-only verification query:

```sql
select
  p.proname as function_name,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'platform_approve_partner_application_invitation';
```

Owner verification passed: exactly one row; `security_definer = false`, browser roles false, and
service role true.

Runtime prerequisites before a real approval test:

- `PLATFORM_PUBLIC_APP_URL` must be the deployed Platform origin so emailed links do not use the
  localhost fallback.
- Existing `RESEND_API_KEY` and `ZENFORMED_EMAIL_FROM` must remain configured in Core.

Safety behavior:

- Raw tokens are never persisted or logged.
- Resend/approval retry rotates the hash on the same logical invitation and invalidates the old link.
- Claimed or revoked invitations cannot be rotated.
- Email failure leaves one valid pending invitation with `sent_at = null`; it does not roll back or
  duplicate the approved application.
- No participation, grant, subscription, entitlement, auth user, or organization is created.

Validation before database application:

- ZenformedCore typecheck passed; focused Partner tests 36 passed, 0 failed.
- ZenformedPlatform typecheck passed.
- No real email or application mutation was performed.

### 2026-08-11 — Slice 6B Platform admin application review UI

Added in ZenformedPlatform:

- `app/api/admin/partner-programs/[programId]/applications/route.ts` — authenticated program-scoped
  application-list relay with Core query filtering preserved.
- `app/api/admin/partner-applications/[applicationId]/route.ts` — authenticated application-detail
  relay.
- `app/api/admin/partner-applications/[applicationId]/review/route.ts` — authenticated PATCH review
  relay.
- `app/admin/promotions/[programId]/applications/page.tsx` — application queue route.
- `app/admin/promotions/applications/[applicationId]/page.tsx` — application detail/review route.
- `src/presentation/components/Admin/AdminPartnerApplicationsPage.tsx` — status-filtered queue with
  applicant, company, state, and submission time.
- `src/presentation/components/Admin/AdminPartnerApplicationDetailPage.tsx` — applicant summary,
  schema-snapshot answer rendering, internal notes, and role-aware review controls.

Modified in ZenformedPlatform:

- `src/infrastructure/coreApi/partnerAdminTypes.ts` — fail-closed list/detail application parsers.
- `src/infrastructure/coreApi/partnerAdminTypes.test.ts` — queue and immutable schema-snapshot detail
  parsing coverage.
- `src/platform/navigation/platformAdminNavigation.ts` — queue/detail/review route builders.
- `src/presentation/components/Admin/AdminPartnerProgramEditor.tsx` — adds View applications for
  persisted programs.
- `src/presentation/components/Admin/admin.module.css` — answer, notes, and review action styles.

Safety behavior:

- `platform_viewer` receives the complete read-only review context but no mutation controls.
- `platform_admin` and `platform_owner` can transition only submitted/in-review records through the
  existing guarded Core service.
- Approved/rejected records are final in this UI and cannot be reviewed again.
- Approval in this slice changes review state only. It sends no email and creates no invitation,
  participation, access grant, subscription, or entitlement.

Validation:

- ZenformedPlatform typecheck passed.
- Focused Partner Platform tests 7 passed, 0 failed.
- Full existing ZenformedPlatform suite 69 passed, 0 failed.
- No migration, Supabase query, or application state was changed during testing.

### 2026-08-11 — Slice 6A public promotion application page

Added in ZenformedPlatform:

- `app/api/partner-programs/[slug]/route.ts` — unauthenticated, no-store Core relay with conservative
  slug validation, 32 KiB body limit, and client-address forwarding to Core rate limiting.
- `app/programs/[slug]/page.tsx` — reusable public program route.
- `src/infrastructure/coreApi/publicPartnerProgramTypes.ts` — fail-closed parser for public-only
  program and application schema data.
- `src/infrastructure/coreApi/publicPartnerProgramTypes.test.ts` — valid public contract and malformed
  select-field coverage.
- `src/presentation/components/PartnerPrograms/PublicPartnerProgramPage.tsx` — no-account application
  form, dynamic question rendering, explicit consent, submission states, and generic success copy.
- `src/presentation/components/PartnerPrograms/partnerProgram.module.css` — responsive public form
  presentation using the existing public product shell.

Modified in ZenformedPlatform:

- `src/presentation/components/PlatformAuthGate.tsx` — explicitly allows `/programs` without a
  session, preserving the no-account application requirement.
- `src/platform/navigation/platformNavigation.ts` — adds the public slug route builder.
- `package.json` — includes public Partner parser tests in the automatic pretest suite.

Safety behavior:

- Only programs Core currently considers open and inside their application window render.
- No account lookup or account requirement exists.
- Required fields, lengths, select options, yes/no answers, and terms version are validated again by
  Core; browser validation is only convenience.
- Duplicate and new submissions retain the same public success response.
- The page exposes no program ID, benefits, internal name, applications, or admin metadata.

Validation:

- ZenformedPlatform typecheck passed after strict parser narrowing correction.
- Focused Partner Platform tests 6 passed, 0 failed.
- Full existing ZenformedPlatform suite 69 passed, 0 failed.
- No migration, Supabase query, account, or application data was created during testing.

### 2026-08-11 — Slice 5C Platform promotion create/edit UI

Added in ZenformedPlatform:

- `app/api/admin/partner-programs/[programId]/route.ts` — authenticated detail and update relay.
- `app/admin/promotions/new/page.tsx` — new promotion editor route.
- `app/admin/promotions/[programId]/page.tsx` — existing promotion editor route.
- `src/presentation/components/Admin/AdminPartnerProgramEditor.tsx` — draft-first editor for program
  metadata, open/close window, terms/form versions, explicit per-app plan/duration benefits, and
  reusable short-text, long-text, select, and yes/no application questions.

Modified in ZenformedPlatform:

- `app/api/admin/coreAdminRelay.ts` — adds bounded authenticated POST/PUT/PATCH relay behavior.
- `app/api/admin/partner-programs/route.ts` — relays atomic program creation.
- `src/infrastructure/coreApi/partnerAdminTypes.ts` — maps full editable program detail and benefits.
- `src/infrastructure/coreApi/partnerAdminTypes.test.ts` — verifies editable detail parsing.
- `src/presentation/components/Admin/AdminPartnerProgramsPageContent.tsx` — enables real new/edit
  links now that their routes exist.
- `src/presentation/components/Admin/admin.module.css` — editor layout and responsive form styles.

Safety behavior:

- New programs default to `draft`.
- At least one explicit app benefit is required before saving.
- Inactive apps cannot be newly selected in the UI.
- The complete configuration is sent once to the existing atomic Core RPC; no partial benefit writes.
- Viewer attempts remain rejected by Core even if a request is constructed manually.

Validation:

- ZenformedPlatform typecheck passed.
- Focused Partner Platform tests 4 passed, 0 failed.
- Full existing ZenformedPlatform suite 69 passed, 0 failed.
- No migration, Supabase query, or program data was created.

### 2026-08-11 — Slice 5B staff-safe registered-app catalog

Modified in ZenformedCore:

- `src/partnerPrograms/partnerAdminService.ts` — adds a read-only registered-app catalog limited to
  UUID, slug, display name, and status.
- `src/partnerPrograms/partnerAdminService.test.ts` — verifies the narrow selected column contract.
- `src/http/partnerProgramsAdminHttp.ts` — adds the existing-staff-authenticated catalog handler.
- `src/http/server.ts` — registers `GET /admin/partner-apps`.

Added/modified in ZenformedPlatform:

- `app/api/admin/partner-apps/route.ts` — authenticated relay to the Core catalog.
- `src/infrastructure/coreApi/partnerAdminTypes.ts` — typed fail-closed app catalog parser.
- `src/infrastructure/coreApi/partnerAdminTypes.test.ts` — valid and malformed app catalog coverage.
- `src/platform/navigation/platformAdminNavigation.ts` — adds the internal catalog API route.

Validation:

- ZenformedCore typecheck passed; focused Partner tests 34 passed, 0 failed.
- ZenformedPlatform typecheck passed; focused Partner tests 3 passed, 0 failed.
- No database migration, Supabase query, or data mutation was required.

The catalog does not expose subscriptions, entitlements, capabilities, organization access, or
application-specific authorization. It exists only to persist explicit benefit app UUIDs.

### 2026-08-11 — Slice 5A Platform admin Promotions list

Added in ZenformedPlatform:

- `app/api/admin/partner-programs/route.ts` — authenticated existing-admin relay to the Core program
  list endpoint.
- `app/admin/promotions/page.tsx` — Promotions route inside the existing admin layout and gate.
- `src/infrastructure/coreApi/partnerAdminTypes.ts` — fail-closed mapping from Core database-shaped
  program rows to Platform UI types.
- `src/infrastructure/coreApi/partnerAdminTypes.test.ts` — valid mapping and malformed-payload tests.
- `src/presentation/components/Admin/AdminPartnerProgramsPageContent.tsx` — Core-backed loading,
  error, empty, and program-list states.

Modified in ZenformedPlatform:

- `src/platform/navigation/platformAdminNavigation.ts` — adds Promotions navigation and route/API
  definitions.
- `src/presentation/components/Admin/admin.module.css` — adds small reusable heading and muted-text
  styles for the list.
- `package.json` — runs the Partner parser tests automatically before the existing suite.

The list intentionally exposes no create/edit links yet. A benefit must reference explicit
`platform_apps.id` values, and Core does not yet expose the staff-safe app catalog required by the
editor. No dead or guess-based form controls were shipped.

Validation:

- ZenformedPlatform `npm run typecheck` — passed.
- Focused Partner Platform tests — 2 passed, 0 failed.
- Full existing ZenformedPlatform suite — 69 passed, 0 failed (after the 2 Partner pretests).
- No migration, Supabase query, or data mutation was required.

### 2026-08-11 — Slice 4E complete admin program-detail read

Modified in ZenformedCore:

- `src/partnerPrograms/partnerAdminService.ts` — loads one complete reusable program including its
  application schema and explicit benefit rows with app slug, display name, and status.
- `src/partnerPrograms/partnerAdminService.test.ts` — verifies explicit app benefit metadata is
  preserved in the admin detail result.
- `src/http/partnerProgramsAdminHttp.ts` — adds the authenticated detail handler with UUID and
  not-found handling.
- `src/http/partnerProgramsAdminHttp.test.ts` — adds invalid-ID boundary coverage.
- `src/http/server.ts` — registers `GET /admin/partner-programs/:programId` without overlapping the
  existing applications route.

Validation:

- `npm run typecheck` — passed.
- Focused Partner tests — 33 passed, 0 failed.

No migration or Supabase query is required for this slice. No data was created or modified.

### 2026-08-11 — Slice 4D admin program-save HTTP endpoints

Modified in ZenformedCore:

- `src/http/partnerProgramsAdminHttp.ts` — adds validated admin/owner program creation and update
  handlers backed exclusively by the atomic configuration RPC.
- `src/http/partnerProgramsAdminHttp.test.ts` — adds program route-separation, viewer-denial, and
  malformed-configuration tests.
- `src/http/server.ts` — registers `POST /admin/partner-programs` and
  `PUT /admin/partner-programs/:programId`.

Validation:

- `npm run typecheck` — passed.
- Focused Partner tests — 31 passed, 0 failed.

No program was created during testing. No invitation, email, participation, access grant,
subscription, entitlement, auth, or BuildCore behavior changed.

### 2026-08-11 — Slice 4C atomic program configuration

Added in ZenformedCore:

- `sql/00055_save_partner_program_configuration.sql` — service-role-only PostgreSQL function that
  atomically creates or updates one reusable program and replaces its explicit app benefits. Any
  invalid/duplicate/unknown app benefit rolls back the entire operation. Configuration replacement
  is refused after the program has issued any invitation.

Modified in ZenformedCore:

- `src/partnerPrograms/partnerAdminService.ts` — calls the atomic RPC only for existing
  `platform_admin` and `platform_owner` roles and maps locked/not-found outcomes.
- `src/partnerPrograms/partnerAdminService.test.ts` — verifies the single-RPC payload and that a
  viewer cannot invoke the save.

Database execution:

1. Run the complete contents of `sql/00055_save_partner_program_configuration.sql` in the Supabase
   SQL editor.
2. Run the verification query below. Do not create a real program in this migration checkpoint.

```sql
select
  p.proname as function_name,
  p.prosecdef as security_definer,
  has_function_privilege(
    'anon',
    p.oid,
    'EXECUTE'
  ) as anon_can_execute,
  has_function_privilege(
    'authenticated',
    p.oid,
    'EXECUTE'
  ) as authenticated_can_execute,
  has_function_privilege(
    'service_role',
    p.oid,
    'EXECUTE'
  ) as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'platform_save_partner_program_configuration';
```

Owner verification passed: exactly one row; `security_definer = false`, both browser-role execute
values are false, and `service_role_can_execute = true`.

No program/application/invitation/participation/grant data is created by the migration itself.
Auth, Stripe, subscriptions, existing entitlements, and BuildCore are untouched.

Validation before database application:

- `npm run typecheck` — passed.
- Focused Partner tests — 29 passed, 0 failed.

### 2026-08-11 — Slice 4B Core admin HTTP endpoints

Added in ZenformedCore:

- `src/http/partnerProgramsAdminHttp.ts` — authenticated staff-only program/application reads and
  guarded application review endpoint, UUID/filter validation, bounded JSON body handling, and
  viewer-versus-manager enforcement through the existing Platform staff roles.
- `src/http/partnerProgramsAdminHttp.test.ts` — route separation, list-filter validation,
  viewer read-only enforcement, and invalid-decision tests.

Modified in ZenformedCore:

- `src/http/server.ts` — registers the new `/admin/partner-programs` and
  `/admin/partner-applications` routes.
- `package.json` — includes the Slice 4B HTTP tests in the automatic Partner pretest suite.

Available endpoints:

- `GET /admin/partner-programs`
- `GET /admin/partner-programs/:programId/applications?status=...&limit=...`
- `GET /admin/partner-applications/:applicationId`
- `PATCH /admin/partner-applications/:applicationId/review`

Approval still changes review state only. No invitation is issued, no email is sent, and no
participation or access grant is created.

Validation:

- `npm run typecheck` — passed.
- Focused Partner tests — 27 passed, 0 failed.
- Normal `npm test` lifecycle runs all 27 Partner tests first; all passed. The existing suite then
  remained at 178 passed and the same 1 pre-existing notification mock failure in
  `markAllPlatformNotificationsRead`.

### 2026-08-11 — Slice 4A Core admin services

Added in ZenformedCore:

- `src/partnerPrograms/partnerAdminService.ts` — existing-staff-role permissions, reusable program
  configuration validation, explicit-benefit validation, program/application reads, application
  detail, and guarded submitted/in-review decision transitions.
- `src/partnerPrograms/partnerAdminService.test.ts` — viewer/admin/owner boundaries, reusable program
  validation, explicit benefit safety, and review validation tests.

Modified in ZenformedCore:

- `package.json` — includes the Slice 4A tests in the automatic Partner pretest suite.

Approval in this slice changes application review state only. It does not issue an invitation, send
email, create participation or grants, or change auth, Stripe, subscriptions, entitlements, or apps.

Validation:

- `npm run typecheck` — passed.
- Focused Partner tests — 23 passed, 0 failed.
- Normal `npm test` lifecycle runs all 23 Partner tests first; all passed. The existing suite then
  remained at 178 passed and the same 1 pre-existing notification mock failure in
  `markAllPlatformNotificationsRead`.

### 2026-08-11 — Slice 3B public Core HTTP endpoints

Added in ZenformedCore:

- `src/http/partnerProgramsHttp.ts` — public open-program read and unauthenticated application
  submission handlers, 32 KiB request limit, generic duplicate-safe responses, no-store caching,
  and a basic per-client submission rate limit.
- `src/http/partnerProgramsHttp.test.ts` — route matching, public response shaping, valid submission,
  validation/unavailable behavior, and rate-limit tests.

Modified in ZenformedCore:

- `src/http/server.ts` — registers only `GET /partner-programs/:slug` and
  `POST /partner-programs/:slug/applications` before existing product routes.
- `package.json` — runs all focused Partner tests automatically as the existing test command's
  `pretest` step without rewriting the legacy regression command.

Admin routes, Platform UI, invitations, email, participation, grants, auth, Stripe, subscriptions,
existing entitlements, and BuildCore changed: no.

Validation:

- `npm run typecheck` — passed.
- Focused Partner HTTP/domain/policy tests — 19 passed, 0 failed.
- Normal `npm test` lifecycle runs the 19 Partner tests first; all passed. The existing suite then
  remained at 178 passed and the same 1 pre-existing notification mock failure.

### 2026-08-11 — Slice 3A Core program/application services

Added in ZenformedCore:

- `src/partnerPrograms/partnerProgramTypes.ts` — reusable program, form schema, application record,
  and repository contracts.
- `src/partnerPrograms/partnerApplicationValidation.ts` — bounded reusable field-schema and answer
  validation for text, long text, select, and boolean questions.
- `src/partnerPrograms/partnerProgramRepositorySupabase.ts` — service-role repository mapping only
  the approved Partner program/application tables.
- `src/partnerPrograms/partnerApplicationService.ts` — public program availability and submission
  orchestration, normalization, terms-version enforcement, schema snapshots, and duplicate-safe
  generic responses.
- `src/partnerPrograms/partnerApplicationService.test.ts` — service and safety tests using an
  in-memory repository.

HTTP routes, Platform pages, admin UI, invitations, participation, grants, email, and runtime
entitlement integration changed: no.

Validation:

- `npm run typecheck` — passed.
- Focused Partner tests — 14 passed, 0 failed (6 application/service tests and 8 precedence tests).
- Existing Core regression suite — unchanged at 178 passed, 1 pre-existing notification mock
  failure in `markAllPlatformNotificationsRead`.

### 2026-08-11 — Slice 2C application-schema correction

Added in ZenformedCore:

- `sql/00053_platform_partner_program_application_schema.sql` — adds a versioned reusable
  application-question definition to programs.

Reason:

- `answers_json` could store submissions, but the approved schema had no persistent source defining
  which questions belong to each reusable program. Continuing without this correction would have
  hardcoded Founders-specific questions in application code.

Migration applied to Supabase: yes, by owner; both columns verified non-null with expected defaults.  
Protected tables, auth, Stripe, subscriptions, entitlements, and runtime code changed: no.

### 2026-08-11 — Slice 2D application-schema snapshot correction

Added in ZenformedCore:

- `sql/00054_platform_partner_application_schema_snapshot.sql` — stores the exact form version and
  schema snapshot on every submitted application.

Reason:

- Programs are reusable and editable. A version on the program alone cannot explain historical
  answers after its questions change. The applications table is empty, so the non-null snapshot can
  be added without inventing or backfilling data.

Migration applied to Supabase: yes, by owner; both snapshot columns verified non-null.  
Protected tables, auth, Stripe, subscriptions, entitlements, and runtime code changed: no.

### 2026-08-11 — Database contamination reconciliation

- Confirmed the prior reverted implementation still had six RLS-enabled Partner tables and test
  data in Supabase.
- Documented exact observed counts and the owner-confirmed test email.
- Added a guarded, transactional, dependency-ordered cleanup query that refuses to execute if counts
  or email differ and intentionally omits `CASCADE`.
- Hardened `00052_platform_partner_programs.sql` by removing `if not exists` from new table/index
  creation so incompatible pre-existing objects fail immediately rather than producing a mixed
  schema.
- Cleanup has not been executed by Codex. Supabase state remains owner-controlled.

### 2026-08-11 — Slice 2B

Added in ZenformedCore:

- `sql/00052_platform_partner_programs.sql` — additive creation of the six approved Partner tables,
  constraints, indexes, RLS enablement, browser-role privilege removal, and existing service-role
  access.

Updated documentation:

- Added the exact migration file to run, six read-only verification queries with expected results,
  and a dependency-ordered rollback query with a destructive-data warning.
- Deferred approval/claim/revocation database functions until their Core service contracts exist and
  can be tested; the current migration is storage/security foundation only.

Migration applied to Supabase: yes, by owner.  
Verification result: passed — 6 Partner tables, RLS enabled on all 6, 0 browser policies, 0
browser privileges, and 0 rows in every new Partner table.  
Existing tables altered: none.  
Auth, Stripe, subscriptions, and runtime entitlement resolution changed: no.

### 2026-08-11 — Slice 2A

Updated documentation only:

- Replaced the conceptual schema outline with exact proposed columns, foreign keys, lifecycle
  states, uniqueness rules, indexes, retention rules, and table ownership.
- Defined RLS-deny-by-default access through Core, reuse of `platform_staff_users`, and staff role
  permissions.
- Defined required atomic transitions for approval, claim/activation, and revocation.
- Explicitly documented sensitive and protected data that Partner tables will not store.

Added or modified application code: none.  
Created migration or executable SQL: none.  
Database, Supabase, Stripe, auth, and runtime access changed: no.  
Tests run: not applicable; documentation-only schema proposal.

### 2026-08-11 — Slice 1

Added in ZenformedCore:

- `src/partnerPrograms/partnerAccessGrantTypes.ts` — database-independent Partner grant, base
  access, and effective-resolution types.
- `src/partnerPrograms/partnerPlanPrecedence.ts` — pure active-window and strongest-plan policy;
  equal plans preserve base-entitlement provenance.
- `src/partnerPrograms/partnerPlanPrecedence.test.ts` — tests for paid Pro preservation, temporary
  Starter upgrade, promotion-only access, expiration, revocation/future/malformed inputs, multiple
  grants, equal-plan provenance, and time-boundary behavior.

Modified application code: none outside the new isolated policy files.  
Runtime integration: none.  
Database reads or writes: none.  
Created migrations: none.  
Auth, Stripe, subscriptions, and existing entitlement resolution changed: no.

Validation:

- `npm run typecheck` — passed.
- Focused Partner policy tests — 8 passed, 0 failed.
- Existing Core regression suite — 178 passed, 1 failed. The failure is the pre-existing
  `markAllPlatformNotificationsRead` test mock error
  `service.from(...).select(...).eq is not a function`; Slice 1 does not touch notification code.
- Restricted-sandbox `tsx` initially failed before loading tests because Windows returned
  `uv_os_get_passwd ENOMEM`; tests were rerun successfully outside that restricted account.

### 2026-08-11 — Slice 0

Added:

- `ZenformedPlatform/docs/partner-program.md` — architecture, safety contract, staged file plan,
  verification requirements, and implementation record.

Modified application code: none.  
Created migrations: none.  
Packages or environment changed: none.  
Supabase or Stripe changed: none.  
Tests run: not applicable; documentation-only slice.

### 2026-08-11 — Slice 7B invitation acceptance and atomic activation

Added in ZenformedCore:

- `sql/00057_claim_partner_invitation_grants.sql` — service-only atomic invitation claim. It locks
  the invitation, rechecks pending/expiry, approved application, verified matching auth email, and
  active organization membership, then creates one participation and snapshots every configured
  program benefit into a time-bound access grant.
- `src/partnerPrograms/partnerInvitationClaimService.ts` and test — hash-only lookup/claim service
  using the existing preferred organization membership resolver.
- `src/http/partnerInvitationHttp.ts` — public token lookup and authenticated claim endpoints.

Modified in ZenformedCore:

- `src/http/server.ts` — registers the two invitation endpoints.
- `package.json` — includes claim coverage in the focused Partner suite.

Added in ZenformedPlatform:

- `app/api/partner-invitations/lookup/route.ts` and `claim/route.ts` — server relays to Core.
- `app/partner-invitations/accept/page.tsx` and
  `src/presentation/components/PartnerPrograms/PartnerInvitationAcceptPage.tsx` — existing
  login/register resume path, default-organization ensure, claim, and success UI.

Modified in ZenformedPlatform:

- `src/presentation/components/PlatformAuthGate.tsx` — permits the public invitation route.
- `src/presentation/components/PartnerPrograms/partnerProgramsPublic.module.css` — acceptance UI.

Migration `00057` is ready but must be applied and verified by the owner before testing a real
approval/claim flow.

### 2026-08-11 — Slice 7C additive runtime access resolution

Added in ZenformedCore:

- `src/partnerPrograms/effectivePartnerEntitlement.ts` and test — reads active grants for the
  caller's active organizations and merges them with the existing entitlement result using the
  established strongest-plan policy.

Modified in ZenformedCore:

- `src/entitlementSnapshot.ts` — optional access provenance only.
- `src/http/platformSessionProfile.ts` — the existing app-entitlement read endpoint now returns the
  stronger of normal access and an active Partner grant.
- `package.json` — includes effective-access coverage.

This does not insert, update, or delete `platform_app_entitlements`, subscriptions, Stripe records,
auth users, or organization memberships. Billing operations continue using the original entitlement
resolver, so promotional access cannot masquerade as a cancellable paid subscription. App launch
has no separate entitlement write or gate; launched apps use the existing Core entitlement read.

Validation at handoff:

- Core `npm run typecheck` — passed.
- Core focused Partner suite — 40 passed, 0 failed.
- Core existing regression suite — 178 passed, 1 failed: the same pre-existing notification mock
  failure in `markAllPlatformNotificationsRead` (`service.from(...).select(...).eq is not a
  function`).
- Platform `npm run typecheck` — passed.
- Platform focused Partner parser suite — 7 passed, 0 failed.
- Platform existing regression suite — 69 passed, 0 failed.

## Consolidated touched-file manifest

The exact working-tree scope at handoff is recorded below. BuildCore was not touched.

ZenformedCore modified files:

- `package.json`
- `src/entitlementSnapshot.ts`
- `src/http/platformSessionProfile.ts`
- `src/http/server.ts`

ZenformedCore added files:

- `sql/00052_platform_partner_programs.sql`
- `sql/00053_platform_partner_program_application_schema.sql`
- `sql/00054_platform_partner_application_schema_snapshot.sql`
- `sql/00055_save_partner_program_configuration.sql`
- `sql/00056_approve_partner_application_invitation.sql`
- `sql/00057_claim_partner_invitation_grants.sql`
- `src/email/templates/partnerProgramInvitationEmail.ts`
- `src/http/partnerInvitationHttp.ts`
- `src/http/partnerProgramsAdminHttp.ts`
- `src/http/partnerProgramsAdminHttp.test.ts`
- `src/http/partnerProgramsHttp.ts`
- `src/http/partnerProgramsHttp.test.ts`
- every file under `src/partnerPrograms/`: `effectivePartnerEntitlement.ts` and test,
  `partnerAccessGrantTypes.ts`, `partnerAdminService.ts` and test, `partnerApplicationService.ts` and
  test, `partnerApplicationValidation.ts`, `partnerInvitationClaimService.ts` and test,
  `partnerInvitationService.ts` and test, `partnerPlanPrecedence.ts` and test,
  `partnerProgramRepositorySupabase.ts`, and `partnerProgramTypes.ts`.

ZenformedPlatform modified files:

- `app/api/admin/coreAdminRelay.ts`
- `package.json`
- `src/platform/navigation/platformAdminNavigation.ts`
- `src/platform/navigation/platformNavigation.ts`
- `src/presentation/components/Admin/admin.module.css`
- `src/presentation/components/PlatformAuthGate.tsx`

ZenformedPlatform added files:

- `app/admin/promotions/page.tsx`
- `app/admin/promotions/new/page.tsx`
- `app/admin/promotions/[programId]/page.tsx`
- `app/admin/promotions/[programId]/applications/page.tsx`
- `app/admin/promotions/applications/[applicationId]/page.tsx`
- `app/api/admin/partner-applications/[applicationId]/route.ts`
- `app/api/admin/partner-applications/[applicationId]/review/route.ts`
- `app/api/admin/partner-apps/route.ts`
- `app/api/admin/partner-programs/route.ts`
- `app/api/admin/partner-programs/[programId]/route.ts`
- `app/api/admin/partner-programs/[programId]/applications/route.ts`
- `app/api/partner-invitations/claim/route.ts`
- `app/api/partner-invitations/lookup/route.ts`
- `app/api/partner-programs/[slug]/route.ts`
- `app/partner-invitations/accept/page.tsx`
- `app/programs/[slug]/page.tsx`
- `src/infrastructure/coreApi/partnerAdminTypes.ts` and test
- `src/infrastructure/coreApi/publicPartnerProgramTypes.ts` and test
- `src/presentation/components/Admin/AdminPartnerApplicationDetailPage.tsx`
- `src/presentation/components/Admin/AdminPartnerApplicationsPage.tsx`
- `src/presentation/components/Admin/AdminPartnerProgramEditor.tsx`
- `src/presentation/components/Admin/AdminPartnerProgramsPageContent.tsx`
- `src/presentation/components/PartnerPrograms/PartnerInvitationAcceptPage.tsx`
- `src/presentation/components/PartnerPrograms/PublicPartnerProgramPage.tsx`
- `src/presentation/components/PartnerPrograms/partnerProgram.module.css`
- `docs/partner-program.md`

## Owner checklist

1. In Supabase SQL Editor, run the complete contents of
   `ZenformedCore/sql/00057_claim_partner_invitation_grants.sql` once.
2. Run the verification query below. Expected: one row with `security_definer`, `anon_can_execute`,
   and `authenticated_can_execute` all `false`, and `service_role_can_execute` `true`.

```sql
select
  p.proname as function_name,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'platform_claim_partner_invitation';
```

3. Deploy ZenformedCore, then ZenformedPlatform. Confirm Core has its existing Supabase service-role
   configuration and Platform can reach Core; the already-set `PLATFORM_PUBLIC_APP_URL`,
   `RESEND_API_KEY`, and `ZENFORMED_EMAIL_FROM` remain required for invitation email.
4. Open Platform Admin → Promotions. Confirm the Founders program benefit is Growth for every app,
   duration 6 months, and the application window is open. Save it.
5. Submit a fresh application from `/programs/founders` while signed out.
6. In Admin → Promotions → Applications, open it and approve it. Confirm the invitation email
   arrives. Do not reuse an invitation already claimed or generated before the final deployment.
7. Open the email link. Register or log in with the exact approved email, complete the existing
   email verification if required, then accept. The existing default organization is used; no new
   auth or membership system is created.
8. Open an app and confirm the entitlement response reports Growth with
   `accessSource: "partner_grant"` and an expiry about six calendar months after acceptance. A paid
   Pro entitlement must remain Pro; an equal paid Growth entitlement keeps base provenance.
9. Optional local verification: run `npm run typecheck` and `npm run pretest` in both repositories.

## Review gate

Implementation is complete in the repositories. Production activation requires only owner-run
migration `00057`, deployment, and the end-to-end checklist above.
