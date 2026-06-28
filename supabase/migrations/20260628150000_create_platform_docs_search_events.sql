-- Documentation search analytics events.
-- Writes use service-role server APIs only; RLS blocks direct client access.

create table if not exists public.platform_docs_search_events (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  normalized_query text not null,
  product text null,
  results_count integer not null default 0,
  clicked_article_id uuid null references public.platform_docs_articles (id) on delete set null,
  user_id uuid null,
  organization_id uuid null,
  session_id text null,
  created_at timestamptz not null default now(),
  constraint platform_docs_search_events_query_check check (char_length(query) > 0),
  constraint platform_docs_search_events_normalized_query_check check (char_length(normalized_query) > 0),
  constraint platform_docs_search_events_results_count_check check (results_count >= 0)
);

create index if not exists platform_docs_search_events_normalized_query_idx
  on public.platform_docs_search_events (normalized_query);

create index if not exists platform_docs_search_events_no_results_idx
  on public.platform_docs_search_events (created_at desc)
  where results_count = 0;

create index if not exists platform_docs_search_events_created_at_idx
  on public.platform_docs_search_events (created_at desc);

create index if not exists platform_docs_search_events_clicked_article_id_idx
  on public.platform_docs_search_events (clicked_article_id)
  where clicked_article_id is not null;

alter table public.platform_docs_search_events enable row level security;

comment on table public.platform_docs_search_events is
  'Documentation search analytics. Inserts and click updates use service-role server APIs.';

comment on column public.platform_docs_search_events.normalized_query is
  'Trimmed, lowercased query with collapsed whitespace for aggregation.';

comment on column public.platform_docs_search_events.results_count is
  'Number of published public articles returned for the search. Zero indicates a no-results search.';

comment on column public.platform_docs_search_events.clicked_article_id is
  'Optional article clicked from the search results page for this search event.';
