import type { DocsArticleVisibility } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
export type PlatformDocsArticleStatus = 'draft' | 'published' | 'archived';

export type UpsertPlatformDocsArticleInput = {
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly visibility: DocsArticleVisibility;
  readonly status: PlatformDocsArticleStatus;
  readonly tags: readonly string[];
  readonly estimatedReadTimeMinutes: number;
  readonly author: string;
  readonly bodyMarkdown: string;
  readonly authorContext?: string;
  readonly source?: string;
  readonly publishedAt?: string | null;
};

export type PlatformDocsArticleRow = {
  readonly id: string;
  readonly product_slug: string;
  readonly category_slug: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly visibility: DocsArticleVisibility;
  readonly status: PlatformDocsArticleStatus;
  readonly tags: readonly string[];
  readonly estimated_read_time_minutes: number | null;
  readonly author: string | null;
  readonly body_markdown: string;
  readonly author_context: string | null;
  readonly source: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly published_at: string | null;
  readonly archived_at: string | null;
  readonly deleted_at: string | null;
};

export const PLATFORM_DOCS_ARTICLES_TABLE = 'platform_docs_articles';
