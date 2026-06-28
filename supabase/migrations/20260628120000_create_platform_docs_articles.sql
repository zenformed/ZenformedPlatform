-- Platform documentation articles (database source of truth for public docs).
-- Admin writes use service-role server APIs; public reads use RLS for published/public rows.

create table if not exists public.platform_docs_articles (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  category_slug text not null,
  slug text not null,
  title text not null,
  summary text not null,
  visibility text not null default 'public',
  status text not null default 'draft',
  tags text[] not null default '{}',
  estimated_read_time_minutes integer,
  author text,
  body_markdown text not null,
  author_context text,
  source text not null default 'database',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  constraint platform_docs_articles_identity_unique unique (product_slug, category_slug, slug),
  constraint platform_docs_articles_visibility_check
    check (visibility in ('public', 'authenticated', 'staff', 'organization')),
  constraint platform_docs_articles_status_check
    check (status in ('draft', 'published', 'archived'))
);

create index if not exists platform_docs_articles_product_category_status_idx
  on public.platform_docs_articles (product_slug, category_slug, status)
  where deleted_at is null;

create index if not exists platform_docs_articles_public_published_idx
  on public.platform_docs_articles (product_slug, category_slug, slug)
  where status = 'published'
    and visibility = 'public'
    and deleted_at is null;

create index if not exists platform_docs_articles_updated_at_idx
  on public.platform_docs_articles (updated_at desc)
  where deleted_at is null;

alter table public.platform_docs_articles enable row level security;

create policy platform_docs_articles_public_read
  on public.platform_docs_articles
  for select
  to anon, authenticated
  using (
    status = 'published'
    and visibility = 'public'
    and deleted_at is null
  );

comment on table public.platform_docs_articles is
  'Zenformed platform documentation articles. Admin CRUD uses service-role server APIs; anon/authenticated clients may only read published public rows via RLS.';
