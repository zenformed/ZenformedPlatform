import 'server-only';

import {
  isPublishedPublicPlatformDocsArticleRow,
  mapPlatformDocsArticleRowToDocsAdminArticle,
  mapPlatformDocsArticleRowToDocsArticle,
} from '@/platform/docs/docsDatabaseArticleMapper';
import {
  PLATFORM_DOCS_ARTICLE_METRICS_TABLE,
  PLATFORM_DOCS_ARTICLES_TABLE,
  type UpsertPlatformDocsArticleInput,
} from '@/platform/docs/docsDatabaseTypes';
import type {
  DocsArticleHelpfulVote,
  PlatformDocsArticleMetricsRow,
  PlatformDocsArticleRow,
} from '@/platform/docs/docsDatabaseTypes';
import { requireSupabaseServiceRoleClient } from '@/infrastructure/supabase/supabaseServiceRole.server';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { mapFrontmatterToUpsertInput } from '@/platform/docs/docsDatabaseImportMapper';

export { mapFrontmatterToUpsertInput };
export type { UpsertPlatformDocsArticleInput } from '@/platform/docs/docsDatabaseTypes';

function mapRows(rows: readonly PlatformDocsArticleRow[] | null): readonly PlatformDocsArticleRow[] {
  return rows ?? [];
}

export async function loadPublishedPublicDocsArticlesFromDatabase(): Promise<readonly DocsArticle[]> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_DOCS_ARTICLES_TABLE)
    .select('*')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .order('title', { ascending: true });

  if (error) {
    throw new Error(`Failed to load published docs articles: ${error.message}`);
  }

  return mapRows(data as PlatformDocsArticleRow[]).map(mapPlatformDocsArticleRowToDocsArticle);
}

export async function loadDocsAdminArticlesFromDatabase(): Promise<readonly DocsAdminArticle[]> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_DOCS_ARTICLES_TABLE)
    .select('*')
    .is('deleted_at', null)
    .order('title', { ascending: true });

  if (error) {
    throw new Error(`Failed to load admin docs articles: ${error.message}`);
  }

  return mapRows(data as PlatformDocsArticleRow[]).map(mapPlatformDocsArticleRowToDocsAdminArticle);
}

export async function getPlatformDocsArticleRow(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): Promise<PlatformDocsArticleRow | undefined> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_DOCS_ARTICLES_TABLE)
    .select('*')
    .eq('product_slug', product)
    .eq('category_slug', category)
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load docs article row: ${error.message}`);
  }

  return data == null ? undefined : (data as PlatformDocsArticleRow);
}

export async function getDocsAdminArticleFromDatabase(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): Promise<DocsAdminArticle | undefined> {
  const row = await getPlatformDocsArticleRow(product, category, slug);
  if (row == null) {
    return undefined;
  }

  return mapPlatformDocsArticleRowToDocsAdminArticle(row);
}

export async function upsertPlatformDocsArticle(
  input: UpsertPlatformDocsArticleInput,
): Promise<PlatformDocsArticleRow> {
  const supabase = requireSupabaseServiceRoleClient();
  const now = new Date().toISOString();
  const existingRow =
    input.publishedAt === undefined && input.status === 'published'
      ? await getPlatformDocsArticleRow(input.product, input.category, input.slug)
      : undefined;

  const payload = {
    product_slug: input.product,
    category_slug: input.category,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    visibility: input.visibility,
    status: input.status,
    tags: [...input.tags],
    estimated_read_time_minutes: input.estimatedReadTimeMinutes,
    author: input.author,
    body_markdown: input.bodyMarkdown,
    author_context: input.authorContext ?? null,
    source: input.source ?? 'database',
    updated_at: now,
    published_at:
      input.status === 'published'
        ? (input.publishedAt ?? existingRow?.published_at ?? now)
        : null,
    deleted_at: null,
  };

  const { data, error } = await supabase
    .from(PLATFORM_DOCS_ARTICLES_TABLE)
    .upsert(payload, { onConflict: 'product_slug,category_slug,slug' })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to upsert docs article: ${error.message}`);
  }

  return data as PlatformDocsArticleRow;
}

export async function softDeletePlatformDocsDraftArticle(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): Promise<'deleted' | 'not_found' | 'published'> {
  const existing = await getDocsAdminArticleFromDatabase(product, category, slug);
  if (existing == null) {
    return 'not_found';
  }

  if (existing.status === 'published') {
    return 'published';
  }

  const supabase = requireSupabaseServiceRoleClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from(PLATFORM_DOCS_ARTICLES_TABLE)
    .update({ deleted_at: now, updated_at: now })
    .eq('product_slug', product)
    .eq('category_slug', category)
    .eq('slug', slug)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Failed to discard docs article: ${error.message}`);
  }

  return 'deleted';
}

export async function articleExistsInDatabase(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): Promise<boolean> {
  const article = await getDocsAdminArticleFromDatabase(product, category, slug);
  return article != null;
}

export async function listDatabaseArticleSlugs(
  product: DocsProductSlug,
  category: DocsCategorySlug,
): Promise<readonly string[]> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from(PLATFORM_DOCS_ARTICLES_TABLE)
    .select('slug')
    .eq('product_slug', product)
    .eq('category_slug', category)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Failed to list docs article slugs: ${error.message}`);
  }

  return (data ?? []).map((row) => row.slug as string);
}

export function isDatabasePublishedPublicRow(row: PlatformDocsArticleRow): boolean {
  return isPublishedPublicPlatformDocsArticleRow(row);
}

export async function getPublishedPublicArticleDatabaseId(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  slug: string,
): Promise<string | undefined> {
  const row = await getPlatformDocsArticleRow(product, category, slug);
  if (row == null || !isPublishedPublicPlatformDocsArticleRow(row)) {
    return undefined;
  }

  return row.id;
}

export type DocsArticleHelpfulMetrics = {
  readonly helpfulYes: number;
  readonly helpfulNo: number;
};

export async function recordDocsArticleHelpfulVote(
  articleId: string,
  vote: DocsArticleHelpfulVote,
): Promise<DocsArticleHelpfulMetrics> {
  const supabase = requireSupabaseServiceRoleClient();
  const { data: existing, error: readError } = await supabase
    .from(PLATFORM_DOCS_ARTICLE_METRICS_TABLE)
    .select('*')
    .eq('article_id', articleId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read docs article metrics: ${readError.message}`);
  }

  const now = new Date().toISOString();

  if (existing == null) {
    const payload = {
      article_id: articleId,
      helpful_yes: vote === 'yes' ? 1 : 0,
      helpful_no: vote === 'no' ? 1 : 0,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from(PLATFORM_DOCS_ARTICLE_METRICS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create docs article metrics: ${error.message}`);
    }

    const row = data as PlatformDocsArticleMetricsRow;
    return { helpfulYes: row.helpful_yes, helpfulNo: row.helpful_no };
  }

  const current = existing as PlatformDocsArticleMetricsRow;
  const { data, error } = await supabase
    .from(PLATFORM_DOCS_ARTICLE_METRICS_TABLE)
    .update({
      helpful_yes: current.helpful_yes + (vote === 'yes' ? 1 : 0),
      helpful_no: current.helpful_no + (vote === 'no' ? 1 : 0),
      updated_at: now,
    })
    .eq('article_id', articleId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update docs article metrics: ${error.message}`);
  }

  const row = data as PlatformDocsArticleMetricsRow;
  return { helpfulYes: row.helpful_yes, helpfulNo: row.helpful_no };
}
