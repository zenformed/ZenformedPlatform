import { docsArticleId, formatEstimatedReadTime } from '@/platform/docs/docsArticleFrontmatter';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsAdminArticle, DocsAdminArticleStatus } from '@/platform/docs/docsAdminTypes';
import { encodeDocsAdminArticleKey } from '@/platform/docs/docsAdminArticleKey';
import type { PlatformDocsArticleRow } from '@/platform/docs/docsDatabaseTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export function formatDocsLastUpdatedFromTimestamp(value: string): string {
  return value.slice(0, 10);
}

export function mapPlatformDocsArticleRowToDocsArticle(row: PlatformDocsArticleRow): DocsArticle {
  const product = row.product_slug as DocsProductSlug;
  const category = row.category_slug as DocsCategorySlug;

  return {
    id: docsArticleId(product, category, row.slug),
    databaseId: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    product,
    category,
    visibility: row.visibility,
    tags: [...row.tags],
    estimatedReadTime:
      row.estimated_read_time_minutes != null
        ? formatEstimatedReadTime(row.estimated_read_time_minutes)
        : '5 min read',
    lastUpdated: formatDocsLastUpdatedFromTimestamp(row.updated_at),
    author: row.author ?? 'Zenformed Documentation',
    relatedArticles: [],
    content: row.body_markdown,
  };
}

export function mapPlatformDocsArticleRowToDocsAdminArticle(
  row: PlatformDocsArticleRow,
): DocsAdminArticle {
  const product = row.product_slug as DocsProductSlug;
  const category = row.category_slug as DocsCategorySlug;
  const articleKey = encodeDocsAdminArticleKey(product, category, row.slug);
  const status: DocsAdminArticleStatus = row.status === 'published' ? 'published' : 'draft';

  return {
    id: docsArticleId(product, category, row.slug),
    editorId: articleKey,
    articleKey,
    source: 'database',
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    product,
    category,
    visibility: row.visibility,
    status,
    tags: [...row.tags],
    estimatedReadTime:
      row.estimated_read_time_minutes != null
        ? formatEstimatedReadTime(row.estimated_read_time_minutes)
        : '5 min read',
    lastUpdated: formatDocsLastUpdatedFromTimestamp(row.updated_at),
    author: row.author ?? 'Zenformed Documentation',
    authorContext: row.author_context ?? '',
    relatedArticles: [],
    content: row.body_markdown,
  };
}

export function isPublishedPublicPlatformDocsArticleRow(row: PlatformDocsArticleRow): boolean {
  return row.status === 'published' && row.visibility === 'public' && row.deleted_at == null;
}

export function isActivePlatformDocsArticleRow(row: PlatformDocsArticleRow): boolean {
  return row.deleted_at == null;
}
