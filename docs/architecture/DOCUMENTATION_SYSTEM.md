# Zenformed Documentation System

This document is the master product specification and implementation roadmap for the Zenformed documentation platform. It is the single source of truth for all documentation-related work.

**How to use this document**

- Every future task related to documentation should begin by reading this document.
- When architectural decisions change or new functionality is added, update this document before or alongside implementation.
- Prefer updating existing sections over adding ad hoc notes elsewhere.

---

## Vision

The Zenformed documentation platform is a core part of the Zenformed ecosystem—not an ancillary feature of any single product. It provides a unified place for customers, partners, and internal teams to find accurate, current information about the entire Zenformed suite.

The platform is designed to serve multiple purposes over time:

- **Customer documentation** — onboarding, how-to guides, and product reference material
- **Product guides** — structured walkthroughs for each Zenformed application
- **Knowledge base** — searchable answers to common questions
- **Troubleshooting** — diagnostic steps, known issues, and resolution paths
- **Release notes** — product updates integrated into the same system, not siloed elsewhere
- **Future API documentation** — developer-facing reference and integration guides
- **AI knowledge source** — the canonical corpus for Zenformed AI assistants
- **Internal documentation** — staff-only and permission-controlled content where required

This is a **Platform** capability. It lives in the Zenformed Platform repository, shares Platform navigation and auth patterns, and spans My Account, BuildCore, ForgeCore, FormCore, AnalyticsCore, and future products. It is not owned by or scoped to BuildCore alone.

---

## Goals

The documentation system should achieve the following:

- **Single documentation platform** — one hub, one navigation model, one search experience
- **Shared across all Zenformed applications** — consistent structure per product without duplicating infrastructure
- **Public-first with authenticated/private support** — most content is public; sensitive content respects visibility rules
- **Excellent search** — fast, relevant discovery from title through full content and, eventually, semantic retrieval
- **AI-friendly architecture** — structured metadata, stable URLs, and clean markdown to support indexing and citation
- **SEO friendly** — crawlable public pages, meaningful titles and summaries, stable canonical URLs
- **Markdown based** — authors write in markdown; rendering and tooling stay simple and portable
- **Easy to maintain** — clear hierarchy, predictable file/route conventions, minimal special cases
- **Consistent navigation** — Landing → Product → Category → Article everywhere
- **Reusable article model** — one content type powers guides, troubleshooting, release notes, and future API docs

---

## Documentation Hierarchy

The documentation system uses a four-level hierarchy. **Four levels is the maximum planned depth**; deeper nesting is intentionally avoided.

### Level 1 — Documentation hub

**Route:** `/docs`

The top-level landing page introduces the documentation platform and links to each product documentation area.

**Products:**

- My Account
- BuildCore
- ForgeCore
- FormCore
- AnalyticsCore

### Level 2 — Product documentation home

**Example:** `/docs/buildcore`

The product landing page lists categories for that product and provides entry points into its documentation set.

**Example categories (BuildCore):**

- Getting Started
- Projects
- Workflow
- Customers
- Budget
- Payments
- Documents
- Reports
- Settings
- Permissions
- Troubleshooting
- Release Notes

Other products define their own category sets following the same pattern.

### Level 3 — Category

**Example:** `/docs/buildcore/projects`

A category page groups related articles under a single topic. It lists articles, optional category description, and navigation back to the product home.

### Level 4 — Article

**Example:** `/docs/buildcore/projects/create-project`

An individual documentation article. This is the leaf node of the hierarchy—no further URL nesting beneath an article.

---

## URL Structure

URLs follow a predictable, human-readable pattern aligned with the four-level hierarchy.

| Level | Purpose | Pattern | Example |
|-------|---------|---------|---------|
| 1 | Documentation hub | `/docs` | `/docs` |
| 2 | Product home | `/docs/{product}` | `/docs/buildcore` |
| 3 | Category | `/docs/{product}/{category}` | `/docs/buildcore/projects` |
| 4 | Article | `/docs/{product}/{category}/{slug}` | `/docs/buildcore/projects/create-project` |

**Conventions**

- **Product slugs** — lowercase, stable identifiers: `account`, `buildcore`, `forgecore`, `formcore`, `analyticscore`
- **Category slugs** — lowercase, hyphenated where needed: `getting-started`, `release-notes`
- **Article slugs** — lowercase, hyphenated, descriptive: `create-project`, `invite-team-members`
- **My Account** — `/docs/account` (product slug `account` for URL consistency)
- **No trailing slashes** — canonical URLs omit trailing slashes unless platform-wide routing requires otherwise
- **Stable URLs** — slug changes require redirects; broken links harm SEO and AI citation quality

**Examples**

```
/docs
/docs/account
/docs/account/billing/manage-subscription
/docs/buildcore
/docs/buildcore/getting-started/quick-start
/docs/buildcore/projects/create-project
/docs/buildcore/release-notes/buildcore-1-5
/docs/forgecore
/docs/formcore
/docs/analyticscore
```

---

## Navigation Philosophy

Navigation mirrors the content hierarchy and should remain shallow and predictable.

```
Landing Page  →  Product  →  Category  →  Article
     /docs         /docs/buildcore    /docs/buildcore/projects    /docs/buildcore/projects/create-project
```

**Principles**

- Users should always know where they are: hub, product, category, or article
- Breadcrumbs and sidebar navigation reflect the same four levels—no hidden depth
- **Avoid deeper nesting** — if content feels too granular, prefer more categories or cross-linking over additional URL levels
- Product landing pages are the primary entry after `/docs`; categories organize articles; articles are self-contained
- Related articles and in-content links handle adjacency without expanding the hierarchy

---

## Search

Search is a phased capability. Each phase builds on the last without blocking earlier delivery.

### Phase 1 — Basic title/content search

- Search across article titles and body content
- Simple keyword matching with sensible ranking (title matches weighted higher)
- Available from the `/docs` landing page and global docs chrome
- Non-functional placeholder on the landing page today; implementation follows this spec

### Phase 2 — Filtering by product and category

- Scope search to a product (e.g. BuildCore only) or category
- Faceted results: product, category, tags
- Improved relevance when the user is already browsing within a product context

### Phase 3 — Semantic AI search

- Embedding-based retrieval over the full documentation corpus
- Natural-language queries with citation of source articles
- Respects the same visibility and permission rules as browse navigation
- Integrated with the Zenformed AI assistant (see AI Integration)

---

## Permissions

Every article has a **visibility** level. Access control applies at render time, search time, and AI retrieval time—there are no back doors for “public UI, private data.”

| Level | Description |
|-------|-------------|
| **Public** | Anyone can view; indexed for SEO and anonymous search where applicable |
| **Authenticated** | Requires a signed-in Zenformed user |
| **Staff** | Internal Zenformed staff only |
| **Organization** *(future)* | Visible only to members of a specific organization or role within an org |

**Rules**

- Default new customer-facing articles to **Public** unless explicitly marked otherwise
- Search results and AI responses **must** filter by the caller’s effective permissions
- AI must obey the same permissions as the web UI—a user (or anonymous session) never receives content they could not open in the browser
- Permission changes take effect on next request; indexing pipelines must respect visibility on ingest

---

## Article Model

Every documentation article is described by a consistent metadata model. Content may live in markdown files, a CMS, or a database—the model stays the same.

| Field | Description |
|-------|-------------|
| **Title** | Human-readable article title |
| **Slug** | URL segment; unique within product + category |
| **Product** | Parent product (`account`, `buildcore`, etc.) |
| **Category** | Parent category slug |
| **Summary** | Short description for cards, SEO, and search snippets |
| **Visibility** | `public`, `authenticated`, `staff`, `organization` (future) |
| **Tags** | Optional cross-cutting labels for filtering and related content |
| **Estimated Read Time** | Derived or authored; displayed in article chrome |
| **Last Updated** | ISO date; shown to readers and used for freshness signals |
| **Author** | Author name or system identifier |
| **Content** | Markdown body |
| **Related Articles** | Optional list of slugs or IDs for “See also” sections |

Additional fields may be added (e.g. `version`, `deprecated`, `canonicalUrl`) via Architectural Decisions when needed.

---

## Release Notes

Release notes are **part of the documentation system**, not a separate product or microsite.

- Each product may include a **Release Notes** category (e.g. `/docs/buildcore/release-notes`)
- Individual releases are articles (e.g. `/docs/buildcore/release-notes/buildcore-1-5`)
- The `/docs` landing page “Recent Updates” section surfaces latest release-note entries across products
- Search and AI include release notes in the same corpus as guides and troubleshooting
- Format: markdown with clear version, date, and change sections (features, fixes, breaking changes)

---

## AI Integration

The documentation system is the **primary knowledge source** for Zenformed AI. Assistants, in-app help, and future support tooling should ground answers in this corpus rather than ad hoc prompts or unstructured data.

**Long-term AI flow**

```
User Question
      ↓
Search Documentation
      ↓
Search Release Notes
      ↓
Search Internal Documentation (if permitted)
      ↓
Return answer (with citations)
```

**Requirements**

- Responses cite relevant documentation articles (title + URL) where possible
- Semantic search (Phase 3) improves recall for paraphrased questions
- Permission boundaries apply at retrieval—no leakage of staff or org-only content
- Content structure (headings, summaries, stable slugs) is optimized for chunking and indexing
- The `/docs` landing CTA (“Ask AI Assistant”) will connect to this flow when implemented

---

## Future Enhancements

The following are out of scope for initial delivery but aligned with the platform vision:

- Video tutorials embedded in or linked from articles
- Interactive walkthroughs (guided UI tours tied to doc topics)
- Versioned documentation (docs pinned to product version)
- API documentation (OpenAPI-driven or hand-authored reference)
- Organization-specific documentation overlays
- Embedded runnable examples and code snippets
- AI-generated summaries per article or category
- [ ] Documentation analytics dashboard (views, search queries, deflection)
- [x] Reader feedback on articles (helpful / not helpful) — `POST /api/docs/articles/helpful`, `platform_docs_article_metrics`
- [ ] Reader comments on articles

---

## Current Implementation Status

Maintain this checklist as work progresses. Checked items reflect what exists in the Platform repo today.

- [x] Documentation landing page (`/docs`)
- [x] Product landing pages (`/docs/{product}`) — BuildCore implemented
- [x] Category pages (`/docs/{product}/{category}`) — BuildCore lists published public articles per category
- [x] Article template (`/docs/{product}/{category}/{slug}`) — database-backed with markdown fallback
- [x] Markdown content loader (`docs/content/` + frontmatter) — fallback/import source
- [x] Database article storage (`platform_docs_articles` in Supabase/Postgres)
- [x] Markdown renderer (`react-markdown` + `remark-gfm`)
- [x] Search (Phase 1) — `/docs/search?q=...` across published public articles; product/category filters; keyboard shortcuts `/` and ⌘/Ctrl+K
- [ ] Related articles (dynamic logic)
- [ ] Release notes (in-doc system)
- [x] Staff editor (UI shell) — `/admin/docs` console and article editor placeholders
- [x] Staff authoring workflow — block editor, markdown save, image upload
- [x] Staff authoring AI panel (UI + Core AI gateway) — fixed right sidebar; Platform BFF relays to ZenformedCore `POST /ai/docs/authoring`
- [ ] Permissions (visibility enforcement)
- [ ] AI indexing
- [ ] AI semantic search (Phase 3)

**Landing page notes (implemented)**

- Route: `/docs`
- Product cards: My Account, BuildCore, ForgeCore, FormCore, AnalyticsCore
- BuildCore card links to `/docs/buildcore`
- Recent Updates and Popular Articles panels load published articles from the documentation provider (database or markdown fallback), sorted by `updated_at` / `lastUpdated` descending
- Functional search input with keyboard hint (`/` and ⌘/Ctrl+K focus search; Enter or search icon submits)
- Platform shell: shared header, three-dot navigation menu, account pill
- Public route (no auth required to view hub)

**BuildCore product docs (implemented)**

- Route: `/docs/buildcore` — category grid with search hero; category cards show published public article counts when available
- Category pages: `/docs/buildcore/{category}` — list published public articles for that category (title, summary, read time, last updated); empty categories show "Articles coming soon."
- Reusable components: `DocsShell`, `DocsPageHero`, `DocsProductPageHero`, `DocsProductIcon`, `DocsSearch`, `DocsSearchResults`, `DocsSearchPageContent`, `DocsCategoryGrid`, `DocsCategoryArticleList`, `DocsBreadcrumbs`, `DocsCategoryPageContent`
- Typed catalog: `src/platform/docs/docsCatalog.ts`

**Article system (implemented)**

- Sample articles: `/docs/buildcore/getting-started/welcome`, `/docs/buildcore/projects/create-project`, `/docs/buildcore/projects/parent-projects` (aligned to generated BuildCore product knowledge)
- Typed model: `src/platform/docs/docsArticleTypes.ts`
- Content source: markdown files under `docs/content/` with YAML frontmatter
- Loader: `src/platform/docs/docsMarkdownLoader.ts` (reads files, parses frontmatter, maps to `DocsArticle`)
- Provider: `src/platform/docs/docsArticleProvider.ts` — presentation layer depends on this abstraction only
- Catalog index: `src/platform/docs/docsArticleCatalog.ts` (generated from loaded markdown; no embedded article bodies)
- Public category listings: `src/platform/docs/docsPublicArticleCatalog.ts` — filters provider articles to `visibility: public` for category pages and product landing counts
- Public search: `src/platform/docs/docsPublicArticleSearch.ts` — title/summary/category/tags/body search over published public articles; route `/docs/search`
- Components: `DocsArticleView`, `DocsMarkdownContent`, `DocsArticleMetadata`, `DocsArticlePagination`, `DocsRelatedArticles`, `DocsArticleFeedback` (helpful yes/no votes via `POST /api/docs/articles/helpful`)
- Placeholder prev/next and related articles (no functionality yet)

**Markdown content architecture**

- Root folder: `docs/content/`
- Layout: `docs/content/{product}/{category}/{slug}.md`
- Products: `account`, `buildcore`, `forgecore`, `formcore`, `analyticscore` (product folders reserved; articles added as needed)
- BuildCore categories mirror the product catalog (`getting-started`, `projects`, etc.); empty category folders use `.gitkeep` until articles exist
- Adding a published markdown file automatically registers the article — no TypeScript catalog edits required

**Frontmatter standard**

Each article file begins with YAML frontmatter. Required fields: `title`, `slug`, `product`, `category`. Recommended fields: `summary`, `visibility`, `tags`, `estimatedReadTime`, `lastUpdated`, `author`, `published`. Optional navigation: `relatedArticles`, `previousArticle`, `nextArticle` (each references `slug` plus optional `title`, `product`, `category`).

```yaml
---
title: Welcome to BuildCore
slug: welcome
product: buildcore
category: getting-started
summary: Learn the basics of BuildCore.
visibility: public
tags:
  - onboarding
estimatedReadTime: 4
lastUpdated: 2026-03-15
author: Zenformed Documentation
published: true
relatedArticles:
  - slug: create-project
    product: buildcore
    category: projects
    title: Create a Project
nextArticle:
  slug: create-project
  product: buildcore
  category: projects
  title: Create a Project
---
```

- `estimatedReadTime` accepts a number (minutes) or a pre-formatted string; the loader normalizes to display text (e.g. `4 min read`)
- `published: false` excludes the article from the public catalog until ready
- The markdown body (after frontmatter) becomes `DocsArticle.content`; do not repeat the title as an `#` heading when the article template already renders it

**Source-agnostic data flow**

```
Markdown files (seed/fallback)     Database (production)
        ↓                                ↓
   Loader / Provider              Loader / Provider
        ↓                                ↓
           DocsArticle model
                    ↓
              UI (unchanged)
```

Switch with `DOCS_CONTENT_SOURCE`. Run `npm run docs:migrate-to-db` after applying the Supabase migration to import existing markdown articles.

**Staff editor (UI shell implemented)**

- Route: `/admin/docs` — three-panel documentation management console
- Route: `/admin/docs/articles/{editorId}` — reusable article editor layout
- Route: `/admin/docs/articles/{editorId}/preview` — public-style article preview with publish actions
- Typed admin model: `src/platform/docs/docsAdminTypes.ts`
- Markdown-backed catalog: `src/platform/docs/docsAdminCatalog.server.ts` (loads published and draft articles from `docs/content/`)
- Placeholder catalog: `src/platform/docs/docsAdminCatalogData.ts` (legacy UI-only articles without markdown files)
- Components: `DocsAdminConsole`, `DocsAdminContentPlan`, `DocsAdminNewArticleWizard`, `DocsAdminTreePanel`, `DocsAdminToolbar`, `DocsAdminArticleTable`, `DocsAdminArticlePreview`, `DocsAdminArticleEditor`, `DocsAdminArticlePreviewPage`, `DocsRichTextEditor`, `DocsAuthoringAiPanel`

**Staff authoring workflow**

- New Article wizard creates markdown files under `docs/content/{product}/{category}/{slug}.md`
- Slug generation: `src/platform/docs/docsSlug.ts`
- Frontmatter generation: `src/platform/docs/docsFrontmatterGenerator.ts`
- Body template: `src/platform/docs/docsArticleBodyTemplate.ts` (single configurable location)
- Save API: `PUT /api/admin/docs/articles/{articleKey}` writes markdown to disk (draft saves only; cannot set `published: true`)
- Publish API: `POST /api/admin/docs/articles/{articleKey}/publish` validates required fields and starter-template content, then sets `published: true`
- Discard API: `DELETE /api/admin/docs/articles/{articleKey}` permanently deletes draft markdown files (published articles rejected)
- Create API: `POST /api/admin/docs/articles` generates frontmatter, template body, and file (optional `slug` for content-plan articles)
- Image upload API: `POST /api/admin/docs/images` — local dev writes to `public/docs/images/{product}/{articleSlug}/`; production (Vercel) uploads to Supabase Storage bucket `platform-docs-images` via server-side service role
- Editor article key format: `{product}--{category}--{slug}` (legacy keys such as `welcome-to-buildcore` still resolve)
- Rich text editor: TipTap (`DocsRichTextEditor`) with `tiptap-markdown` for transparent markdown load/save
- Authoring extensions: `src/platform/docs/tiptap/` (markdown bridge, callout node) and `src/presentation/components/Admin/Docs/RichText/` (editor UI, toolbar, image node view)
- Toolbar: headings, bold/italic/underline, lists, quote, divider, code block, inline code, link, image upload, callout, undo/redo
- Images upload via existing `POST /api/admin/docs/images` API; inserted at cursor with resize, alignment, alt text, and optional caption
- Markdown files remain the source of truth; authors never edit raw markdown
- Unsaved changes tracking in editor UI
- **Preview → Publish workflow** — editor actions are Discard Draft, Save, and Preview. Preview saves unsaved changes first, then opens `/admin/docs/articles/{editorId}/preview`. Publish is only available on the preview page (`POST /api/admin/docs/articles/{articleKey}/publish`). Preview renders the article with the public `DocsArticleView` component and shows admin metadata (title, product, category, visibility, status, last updated). Publishing is blocked for empty required fields or unchanged starter-template content.
**Database-backed documentation (implemented)**

- Production source of truth: Supabase table `platform_docs_articles` (migration in `supabase/migrations/`)
- Body format remains markdown (`body_markdown` column); UI and `DocsArticle` model unchanged
- Content source switch: `DOCS_CONTENT_SOURCE=database | markdown` (default: `markdown` when unset)
- Public docs, search, and category pages load through `docsPublicArticleLoader.server.ts` → database or markdown provider
- Admin create/save/publish/discard routes write to database when `DOCS_CONTENT_SOURCE=database`
- Admin CRUD uses service-role Supabase client (`SUPABASE_SERVICE_ROLE_KEY`); not direct browser Supabase access
- RLS allows anon/authenticated read of `status = published`, `visibility = public`, `deleted_at is null` only
- Markdown files under `docs/content/` remain for seed/import/fallback; not deleted by migration
- Import script: `npm run docs:migrate-to-db` (idempotent upsert from markdown files)
- Draft discard in database mode soft-deletes via `deleted_at` (published articles cannot be discarded)
- Publishing updates `status`, `published_at`, and `updated_at` immediately — no deploy required

**Documentation images (implemented)**

- Browser uploads continue through `POST /api/admin/docs/images` (staff bearer auth); the Platform API uploads server-side — the service role key is never exposed to the browser
- **Production (Vercel):** Supabase Storage bucket `platform-docs-images`, object path `{productSlug}/{articleSlug}/{filename}` (example: `buildcore/upload-documents-for-a-workflow-task/paperclip-documents-column.png`)
- **Public URL:** Supabase public object URL inserted into markdown, e.g. `https://{project}.supabase.co/storage/v1/object/public/platform-docs-images/buildcore/...`
- **Local dev:** files written under `public/docs/images/{product}/{articleSlug}/` with app-relative URLs (`/docs/images/...`)
- **Legacy articles:** existing markdown that references `/docs/images/...` continues to render from committed static files
- **Validation:** PNG, JPG/JPEG, WEBP, GIF only; max 10 MB; API returns structured errors (`missing_env`, `missing_bucket`, `invalid_file_type`, `file_too_large`, `upload_failed`) instead of empty 500s
- **Required env (production uploads):** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; optional override `DOCS_IMAGES_STORAGE=supabase|filesystem` (defaults to Supabase on Vercel)
- **Migration:** `supabase/migrations/20260628130000_create_platform_docs_images_bucket.sql`

**Documentation landing sections (implemented)**

- `/docs` Popular Articles and Recent Updates load published public articles through `docsLandingCatalog.server.ts` → `getAllDocsArticles()` (database or markdown provider)
- Sort: `updated_at` / `lastUpdated` descending; no hardcoded article titles
- Recent Updates show product name, title, updated date, and article link
- Popular Articles show title and link

**Documentation article metrics (implemented)**

- Table: `platform_docs_article_metrics` (migration `supabase/migrations/20260628140000_create_platform_docs_article_metrics.sql`)
- Columns: `article_id` (FK to `platform_docs_articles`), `views`, `unique_views`, `helpful_yes`, `helpful_no`, timestamps
- Helpful vote API: `POST /api/docs/articles/helpful` — accepts `articleId` or `product` + `category` + `slug` with `vote: yes|no`; server-side service role upsert/increment; no login required
- Article page `DocsArticleFeedback` calls the BFF endpoint; sessionStorage prevents duplicate votes per article in the same browser session
- Metrics writes require `SUPABASE_SERVICE_ROLE_KEY` and `DOCS_CONTENT_SOURCE=database`

**Staff editor (filesystem legacy path)**

- When `DOCS_CONTENT_SOURCE=markdown`, authoring continues to write markdown files under `docs/content/` as before

**Staff authoring AI**

- Fixed right sidebar on `/admin/docs/articles/{editorId}` — always visible on desktop; independent scroll from the editor column
- Purpose: help staff write documentation only; separate from customer-facing AI and future in-app AI
- Action groups: Writing, Selection, SEO & Metadata, Context
- Platform BFF: `POST /api/admin/docs/authoring-ai` (staff bearer auth) relays to ZenformedCore `POST /ai/docs/authoring`
- AI gateway lives in **ZenformedCore** — OpenAI key, provider abstraction, model catalog (`src/ai/aiModelConfig.ts`), prompts, and action orchestration
- **Product knowledge index** grounds Generate Draft output using layered grounding (see below)
- **Hallucination validation** runs in Core before draft insertion — forbidden URLs/labels/features are rejected; one correction retry, then a safe error with structured validation failures (`type`, `rejectedValue`, `reason`, `source`, `phase`) returned to the AI sidebar and logged server-side
- **Documentation catalog grounding** applies only to the separate Generate Related Articles action — Platform BFF loads published and draft admin catalog entries for the current product and passes them to Core
- **Generate Draft never includes Related Articles** — Core prompt forbids the section, then `finalizeGenerateDraftMarkdown()` strips any Related Articles heading, title-only bullets, and `/docs/` links before insertion
- **Generate Draft produces minimal articles** — default structure is Overview, Main Content, and Step-by-step instructions (only for workflow articles). Optional sections (Tips, Notes, Warnings, Common Mistakes, Next Steps, Best Practices, FAQ, Troubleshooting) are omitted unless Author Context, Feature Workflow, or the AI conversation explicitly requests or grounds them; `finalizeGenerateDraftMarkdown()` strips any unrequested optional sections before editor insertion
- **Discard Draft** — draft articles only (`status: draft`, markdown source) show a **Discard Draft** button beside Save/Preview; confirmation permanently deletes the markdown file, empty image folder (if any), and admin catalog entry; Content Plan rows return to **Not Started**; `DELETE /api/admin/docs/articles/{articleKey}` (staff bearer auth). Published articles never show the button
- **Documentation link validation** remains a hard rule for Generate Related Articles — only catalog-backed slugs survive server-side filtering
- Platform client/apply layer unchanged: `createDocsAuthoringAiClient()` → BFF → Core; results apply through TipTap editor commands and metadata handlers
- Related-article suggestions: Platform BFF attaches the ranked admin documentation catalog before calling Core (published and draft markdown plus placeholders; docs content stays in Platform)
- AI returns markdown or text payloads; the editor converts markdown ↔ visual document — authors never edit raw markdown directly

**Documentation AI grounding architecture (BuildCore)**

Generate Draft must not infer workflows from labels alone. Grounding is layered and assembled by the Platform BFF before calling ZenformedCore.

**Grounding layers (in priority order for user flows and UI labels)**

1. **Editorial policy** — `docs/architecture/BUILDCORE_DOCS_CONTEXT.editorial.md` (manual): access patterns, forbidden assumptions, MVP limits
2. **Global product context** — `docs/generated/buildcore.context.json`: routes, navigation, labels, form field catalog (orientation only)
3. **Feature knowledge** — `docs/generated/buildcore.features.json`: structured per-feature scope, relationships, file references, and high-level flows
4. **Feature workflow** — `docs/generated/buildcore.workflows.json` + `docs/architecture/BUILDCORE_WORKFLOWS.editorial.md`: intended user workflows (authoritative for procedural steps)
5. **Implementation knowledge** — `docs/generated/buildcore.implementation.json`: code-derived UI facts extracted from the actual components, services, and API routes that implement the matched feature
6. **Current article metadata** — title, summary, category, tags from the editor request

Permanent pipeline:

`Editorial Policy → Generated Product Context → Generated Feature Knowledge → Feature Workflow → Generated Implementation Knowledge → Current Article Metadata → OpenAI`

**Feature Knowledge Index**

- Generated by `npm run generate:docs-context` alongside global context
- Extractor: `scripts/docsContext/buildcoreFeatureExtractor.ts`
- Types: `src/platform/docs/docsFeatureKnowledgeTypes.ts`
- One entry per major BuildCore feature (Projects, Workflow Tasks, Payments, Budget, Documents, Customers, Workflow Settings, Reports, Permissions, Team Members)
- Each feature includes only code-derived data: purpose, navigation path, creation/edit/delete flows, modals, buttons, form fields, validation, status values, relationships, limitations, routes, React components, API endpoints, domain services, and database tables (when referenced in scanned services)
- Human-readable overview remains in `docs/architecture/BUILDCORE_DOCS_CONTEXT.md` (regenerated; do not edit by hand)

**Author Context (per article)**

- Optional frontmatter field: `authorContext` (staff-only; not rendered on public docs pages)
- Set in the New Article wizard or the Documentation AI sidebar textarea below **Generate Draft**
- Saved with the article markdown file and sent with Generate Draft
- Attached as **LAYER 1** in the grounding payload — highest priority for the specific article unless it violates forbidden URL or security rules
- Staff can paste rough procedural notes; the AI turns them into clean documentation steps

**Feature Workflow Index**

- Generated by `npm run generate:docs-context` from feature knowledge seeds merged with editorial overrides
- Editorial source: `docs/architecture/BUILDCORE_WORKFLOWS.editorial.md` (manual, authoritative for intended user flows)
- Output: `docs/generated/buildcore.workflows.json`
- Extractor: `scripts/docsContext/buildcoreWorkflowExtractor.ts`
- Parser/merge: `src/platform/docs/parseBuildcoreWorkflowEditorial.ts`
- Types: `src/platform/docs/docsWorkflowKnowledgeTypes.ts`
- Each feature includes: `purpose`, `primaryWorkflow`, `alternateWorkflows`, `prerequisites`, `userTips`, `commonMistakes`
- Generate Draft attaches the matched feature workflow as **LAYER 2** in the grounding payload
- Core validates drafts against `commonMistakes` — contradictions reject the draft (with one correction retry)

**Implementation Knowledge Index**

- Generated by `npm run generate:docs-context` from the matched feature’s implementation files
- Output: `docs/generated/buildcore.implementation.json`
- Extractor: `scripts/docsContext/buildcoreImplementationExtractor.ts`
- Content registry: `scripts/docsContext/buildcoreContentRegistry.ts` resolves `buildCoreDashboardContent` paths referenced in component source to actual UI strings
- For each feature, scans only directly related files already listed in feature knowledge (`reactComponents`, `domainServices`, `apiEndpoints`) plus one-hop presentation imports
- Extracts structured facts — not full source files:
  - Actual button labels, modal titles, field labels, column labels, menu items
  - Empty states, confirmation dialogs, validation messages, permission messages
  - Status values from domain modules
  - API operations (route + HTTP method + description)
  - Content path references (`buildCoreDashboardContent.projectDetail.workflow.addTask` → `Add task`)
  - Small label snippets where useful
- Generate Draft attaches only the matched feature’s implementation profile

**Feature lookup (Generate Draft)**

- Platform resolves the closest matching feature using article **category**, **title**, **summary**, and **tags**
- Resolver: `src/platform/docs/resolveDocsFeatureForArticle.ts`
- Implementation resolver: `src/platform/docs/resolveDocsImplementationForFeature.ts`
- Formatter: `src/platform/docs/formatDocsAuthoringGroundingForAi.ts`
- Loader: `loadDocsAuthoringGroundingPayload()` in `docsProductContext.server.ts`
- Only the matched feature + implementation definitions are attached — not the entire indexes
- Falls back to global context + editorial when no feature meets the match threshold

**Implementation validation (Generate Draft)**

- Platform sends `implementationVocabulary` (allowed UI strings) with the Core request
- Vocabulary builder: `src/platform/docs/buildDocsAuthoringVocabulary.ts`
- Core validates drafts before insertion: bold UI labels must exist in implementation vocabulary when implementation context is present
- Rejects invented labels such as **Tasks tab**, **Add Task**, or **Save Task** when the implementation uses **Add task** and **Save task**
- One correction retry with violation messages, then a safe error

**Regenerating product knowledge**

When BuildCore UI labels, routes, form fields, or feature behavior change:

1. Run `npm run generate:docs-context` from the Platform repo (requires sibling `BuildCore/` checkout, or set `BUILDCORE_APP_PATH`).
2. Script writes `docs/generated/buildcore.context.json`, `docs/generated/buildcore.features.json`, `docs/generated/buildcore.workflows.json`, and `docs/generated/buildcore.implementation.json`.
3. Script regenerates `docs/architecture/BUILDCORE_DOCS_CONTEXT.md` from generated data + editorial overlay.
4. Generate Draft automatically uses the latest files via the Platform BFF.

Edit `docs/architecture/BUILDCORE_DOCS_CONTEXT.editorial.md` for documentation policy and `docs/architecture/BUILDCORE_WORKFLOWS.editorial.md` for intended user workflows — not for UI labels (those come from generated implementation knowledge).

**BuildCore content plan (staff)**

- Tab on `/admin/docs`: **Content Plan** — lists the first recommended BuildCore articles grouped by topic (Getting Started, Projects, Workflow, Documents, Payments, Budget, Teams, Permissions, Reports)
- Plan data: `src/platform/docs/docsContentPlan.ts` — titles, summaries, and target category slugs aligned to `docs/generated/buildcore.context.json`
- Each row shows title, category, suggested summary, status (Not Started / Draft / Published), and **Create Article** (or **Open Article** when a markdown or placeholder article already exists)
- Status resolves against the admin article catalog (`product` + `category` + `slug`); markdown files take precedence over placeholders
- **Create Article** opens the New Article wizard prefilled with the planned title and slug; optional `slug` on the create API keeps filenames aligned with the plan
- Public docs rendering and Documentation AI are unchanged — the plan is an authoring checklist only

**Staff article editor layout**

- Desktop-only fixed workspace under the admin header: page body does not scroll; editor column and AI sidebar each scroll independently (`adminMainDocsArticleEditor`)
- Top action row (back link, unsaved badge, Save, Publish) stays fixed above the split workspace

---

## Architectural Decisions

This section records **durable** decisions that future sessions should treat as fixed unless explicitly revised here.

*(Intentionally minimal at launch. Add entries when decisions are made—not for every task or experiment.)*

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-27 | Markdown rendering via `react-markdown` + `remark-gfm` | Keeps authoring in plain markdown with GFM support (tables, task lists, strikethrough); article bodies render in React via `DocsMarkdownContent` |
| 2026-06-27 | Documentation content lives in `docs/content/` as markdown with frontmatter | Authors add `.md` files under `{product}/{category}/`; a loader indexes them at build time; AI or staff can add files without touching TypeScript |
| 2026-06-27 | UI is source-agnostic via `DocsArticleProvider` | Routes and components consume `DocsArticle` through a provider abstraction; markdown loader today, database loader tomorrow — no UI changes required |
| 2026-06-27 | Product docs landing hero includes product icon before title | All `/docs/{product}` pages use `DocsProductPageHero` with `{ProductName} Documentation` on one line (icon + title); icon resolved via `DocsProduct.icon` (`platform` or `app` reference) |
| 2026-06-27 | Staff docs editor lives under `/admin/docs` | Documentation authoring UI is part of the existing Platform Admin shell; public docs remain at `/docs`; admin uses separate `DocsAdminArticle` records with `editorId` for editor routes |
| 2026-06-27 | Staff authoring writes markdown files directly | New articles are created via wizard + filesystem APIs; frontmatter and body templates are generated automatically; public docs provider reloads from disk without UI changes |
| 2026-06-27 | Staff editor uses TipTap rich text over markdown storage | Authors edit a continuous TipTap document; `tiptap-markdown` plus custom callout/image serializers translate ↔ markdown on load/save; markdown files remain the source of truth for public docs and AI |
| 2026-06-27 | Staff authoring AI is editor-scoped | Authoring AI lives in a fixed right sidebar on the staff article editor; it reads/writes TipTap selection and markdown document context — not customer-facing AI; `DocsAuthoringAiClient` is the swap point for a future backend provider |
| 2026-06-27 | BuildCore product knowledge is generated from code | `npm run generate:docs-context` scans BuildCore and writes `docs/generated/buildcore.context.json`; editorial rules stay in `BUILDCORE_DOCS_CONTEXT.editorial.md` |
| 2026-06-27 | Sample BuildCore articles aligned to product context | Existing markdown under `docs/content/buildcore/` updated to match BuildCore UI labels and MVP scope |
| 2026-06-27 | AI docs must be grounded in product context files | Generate Draft loads product truth (e.g. `BUILDCORE_DOCS_CONTEXT.md`) and Core validates output before insertion |
| 2026-06-27 | ZenformedCore is the centralized AI gateway | OpenAI key, provider layer, and model catalog live in Core (`aiModelConfig.ts`); Platform docs editor relays through BFF; future Zenformed AI features reuse Core `/ai/*` |
| 2026-06-27 | Staff authoring AI uses pluggable text providers with OpenAI Responses API | `AiTextCompletionProvider` in Core abstracts model vendors; docs actions use `OPENAI_DOCS_MODEL` (fallback `OPENAI_DEFAULT_MODEL`); Platform BFF → Core `/ai/docs/authoring` |
| 2026-06-27 | Staff article editor uses a fixed split workspace | Article editor page fills viewport height under admin chrome; editor column and AI sidebar scroll independently; Save/Publish header stays fixed — desktop authoring layout only |
| 2026-06-27 | BuildCore content plan lives in admin docs console | `/admin/docs` Content Plan tab tracks recommended first articles by category with status and Create Article workflow; plan data in `docsContentPlan.ts` |
| 2026-06-27 | Documentation AI uses layered feature grounding | Generate Draft sends editorial policy, global context, matched feature knowledge from `buildcore.features.json`, and article metadata; feature lookup by category/title/keywords |
| 2026-06-27 | Documentation AI uses implementation grounding | Generate Draft also sends matched implementation knowledge from `buildcore.implementation.json`; Core validates bold UI labels against implementation vocabulary before draft insertion |

**Template for new entries**

```markdown
| YYYY-MM-DD | Short decision title | Why this choice was made; what alternatives were rejected |
```
