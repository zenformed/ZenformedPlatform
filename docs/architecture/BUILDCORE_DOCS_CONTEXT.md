<!-- AUTO-GENERATED — do not edit manually. Run: npm run generate:docs-context -->

# BuildCore — Documentation AI Product Context

_Generated: 2026-06-28T01:18:11.404Z_
_Source: `C:\Users\Daniel\workspace\Work\Zenformed\ZenformedCore\BuildCore`_

This file combines **generated product knowledge** scanned from the BuildCore application with **manual editorial rules**. Staff authoring AI must treat both sections as authoritative.

---

## Product identity (generated)

| Field | Value |
| --- | --- |
| Product name | BuildCore |
| Product slug | `buildcore` |
| Description | Construction/trades CRM for lead, project, workflow, document, and milestone tracking. |
| Dashboard route | `/dashboard` |
| Parent platform | Zenformed |


## Primary navigation (generated)

### Sidebar

| Label | Route | Notes |
| --- | --- | --- |
| Projects | `/dashboard` | All projects |
| Reports | `/reports` | CRM reports |
| Teams | `/teams` | Teams |
| Workflow Settings | `/workflow-settings` | Workflow settings |


### Header controls

| Control | Label | Notes |
| --- | --- | --- |
| appsLauncher | Open apps | header |
| searchProjects | Search projects… | header search |
| newProjectButton | New project | projects list plus button |
| accountMenu | Account menu | header |
| signOut | Sign out | account menu |


## Routes (generated)

### App routes

| Id | Pattern |
| --- | --- |
| dashboard | `/dashboard` |
| reports | `/reports` |
| teams | `/teams` |
| workflowStages | `/workflow-settings` |


### Project detail routes

| Section | Pattern | Description |
| --- | --- | --- |
| detail | `/projects/{slug}` | Project detail |
| tasks | `/projects/{slug}/tasks` | Workflow tasks |
| documents | `/projects/{slug}/documents` | Documents |
| financials | `/projects/{slug}/financials` | Payments / financials |
| accountability | `/projects/{slug}/accountability` | Accountability |
| budget | `/projects/{slug}/budget` | Budget |
| subproject | `/projects/{parentSlug}/{subSlug}` | Subproject detail |


## Projects list — create project (generated)

1. Open the **Projects** view (`/dashboard`).
2. Select the **plus (+) button** (`New project`).
3. The **New project** modal opens.
4. Submit with **Create project**.

| Element | Label |
| --- | --- |
| Plus button (aria) | New project |
| Modal title | New project |
| Submit button | Create project |
| Cancel button | Cancel |


### Create project form fields

| Field id | Label |
| --- | --- |
| name | Project / customer name |
| industry | Industry |
| customIndustry | Custom industry |
| contactName | Contact name |
| email | Email |
| phone | Phone |
| emailAddresses | Email addresses (up to 4) |
| phoneNumbers | Phone numbers (up to 4) |
| addEmail | + Add email |
| removeEmail | Remove email address |
| addPhone | + Add phone |
| removePhone | Remove phone number |
| priority | Priority |
| stage | Current stage |
| notes | Notes (Max 200) |
| assigned | Assigned to |
| assignedShort | Assigned |
| addressLine1 | Address line 1 |
| addressLine2 | Address line 2 (optional) |
| city | City |
| state | State |
| postalCode | Zip code |


## Project detail (generated)

- Back navigation: **All projects**
- Edit modal title: **Edit project**

| Section id | Label |
| --- | --- |
| projectInformation | Project information |
| financials | Payments |
| workflow | Workflow tasks |
| documents | Documents |
| accountability | Accountability |


## Subprojects (generated)

| Element | Label |
| --- | --- |
| Section title | Subprojects |
| Plus button (aria) | New subproject |
| Modal title | New subproject |
| Submit button | Create project |


## Settings & organization pages (generated)

| Page | Title | Breadcrumb |
| --- | --- | --- |
| workflowSettings | Workflow Settings | Organization / Workflow Settings |
| workflowStages | Workflow Stages | Organization / Workflow Stages |


## Reports (generated)

| Field | Value |
| --- | --- |
| Title | Reports |
| Breadcrumb | CRM / Reports |


## Default pipeline stages (generated fallback catalog)

| Slug | Label | Order |
| --- | --- | --- |
| `new-lead` | New Lead | 1 |
| `contacted` | Contacted | 2 |
| `inspection-scheduled` | Inspection Scheduled | 3 |
| `inspection-complete` | Inspection Complete | 4 |
| `estimate-sent` | Estimate Sent | 5 |
| `waiting-on-approval` | Waiting on Approval | 6 |
| `approved` | Approved | 7 |
| `scheduled` | Scheduled | 8 |
| `in-progress` | In Progress | 9 |
| `completed` | Completed | 10 |
| `invoiced` | Invoiced | 11 |
| `complete` | Complete | 12 |


## Feature flags & demo behavior (generated)

| Id | Description |
| --- | --- |
| interactiveDemo | Interactive Demo |
| demoProjectCreationDisabled | Project creation is not available in this environment. |


---

# BuildCore — Editorial & Safety Rules (manual)

This section is **maintained by hand**. It supplements generated product knowledge from the BuildCore codebase with documentation policy, access patterns, and forbidden assumptions.

Do not invent UI labels, URLs, or workflows that are not listed in the generated product knowledge JSON or in this editorial section.

---

## How customers access BuildCore

- Customers and staff reach BuildCore **through their Zenformed account**, not a standalone marketing site.
- Say: **"Open BuildCore from your Zenformed account"** or **"Sign in to Zenformed and launch BuildCore from the apps menu."**
- BuildCore is launched via Zenformed cross-app handoff (Platform dashboard → apps launcher → BuildCore).
- **Do not mention `buildcore.com`.** That domain is not used for app access in documentation.
- **Do not invent direct login URLs** such as `https://buildcore.com/login` or similar.

### Allowed URL / domain patterns (documentation)

| Pattern | Usage |
|---------|--------|
| Zenformed Platform docs | `/docs/buildcore/...` — link to other help articles only |
| Production app host (when needed) | `buildcore.zenformed.com` — hosting reference only, not primary navigation |
| Platform host (when needed) | `core.zenformed.com` — Zenformed account / Platform home |

### Forbidden URL / domain patterns

- `buildcore.com` (any TLD variant)
- External SaaS URLs not listed above
- Placeholder domains (`example.com`, `yourcompany.com`, etc.)

---

## UI documentation rules

- Use the **plus (+) button** for create actions — do not describe text buttons such as **Create New Project**.
- Modal title for new projects: **New project** (lowercase "project").
- Do not use **New Project** (capital **P**) as a button label.
- Do not refer to a **Project Overview** tab — use **Project information** from generated section labels.
- Do not document a **project type** dropdown unless it appears in generated form fields.
- If exact UI text is uncertain, use generic wording (e.g. "select the plus (+) button in the Projects header").

---

## Features not in MVP (do not document as available)

- Standalone BuildCore marketing website or self-service signup outside Zenformed
- Generic "customer portal" for entire projects unless describing assigned customer workflow tasks
- Import / bulk CSV project import
- Mobile-native apps (web responsive only)
- Public API developer documentation
- Third-party integrations unless added to generated knowledge later
- "Budget shell" as a separate creation wizard step
- "Invite customer portal access" as a single button on project create
- "Assigned team" multi-role assignment during create (only **Assigned to** exists)

---

## Terminology

| Use | Avoid |
|-----|-------|
| BuildCore | Build Core, Buildcore |
| Zenformed account | BuildCore account (prefer Zenformed for sign-in) |
| Projects view / Projects list | Dashboard (when meaning the project pipeline) |
| Workflow tasks | Generic "tasks" when ambiguous |
| Payment milestones | Invoices (unless describing a specific payment state) |
| Subprojects | Child projects (acceptable synonym) |
| plus (+) button | Create New Project button |

---

## Writing guidance for AI drafts

1. Prefer high-level orientation unless the article topic requires step-by-step UI instructions.
2. For step-by-step instructions, only use UI paths confirmed in generated product knowledge.
3. If a step is not confirmed, write generically — do not invent intermediate clicks.
4. Never fabricate keyboard shortcuts, menu paths, or admin settings not in generated knowledge.
5. Documentation cross-links must use `/docs/buildcore/{category}/{slug}` and only existing catalog slugs.
