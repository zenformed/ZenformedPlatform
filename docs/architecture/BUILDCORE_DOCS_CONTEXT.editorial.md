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
