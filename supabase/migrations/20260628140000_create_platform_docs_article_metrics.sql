-- Per-article documentation metrics (views and helpful votes).

create table if not exists public.platform_docs_article_metrics (
  article_id uuid primary key references public.platform_docs_articles (id) on delete cascade,
  views integer not null default 0,
  unique_views integer not null default 0,
  helpful_yes integer not null default 0,
  helpful_no integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_viewed_at timestamptz,
  constraint platform_docs_article_metrics_views_check check (views >= 0),
  constraint platform_docs_article_metrics_unique_views_check check (unique_views >= 0),
  constraint platform_docs_article_metrics_helpful_yes_check check (helpful_yes >= 0),
  constraint platform_docs_article_metrics_helpful_no_check check (helpful_no >= 0)
);

create or replace function public.set_platform_docs_article_metrics_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists platform_docs_article_metrics_set_updated_at on public.platform_docs_article_metrics;

create trigger platform_docs_article_metrics_set_updated_at
before update on public.platform_docs_article_metrics
for each row
execute function public.set_platform_docs_article_metrics_updated_at();

comment on table public.platform_docs_article_metrics is
  'Documentation article engagement metrics. Writes use service-role server APIs.';
