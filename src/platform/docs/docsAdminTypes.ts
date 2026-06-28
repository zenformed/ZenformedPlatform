import type { DocsArticleRef, DocsArticleVisibility } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsAdminArticleStatus = 'draft' | 'published';

export type DocsAdminArticleSource = 'markdown' | 'placeholder' | 'database';

export type DocsAdminArticle = {
  readonly id: string;
  readonly editorId: string;
  readonly articleKey: string;
  readonly contentPath?: string;
  readonly source: DocsAdminArticleSource;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly visibility: DocsArticleVisibility;
  readonly status: DocsAdminArticleStatus;
  readonly tags: readonly string[];
  readonly estimatedReadTime: string;
  readonly lastUpdated: string;
  readonly author: string;
  readonly authorContext: string;
  readonly relatedArticles: readonly DocsArticleRef[];
  readonly previousArticle?: DocsArticleRef;
  readonly nextArticle?: DocsArticleRef;
  readonly content: string;
};

export function isDocsAdminArticleEditable(
  article: Pick<DocsAdminArticle, 'source'>,
): boolean {
  return article.source === 'markdown' || article.source === 'database';
}

export type DocsAdminSelection = {
  readonly productSlug: DocsProductSlug;
  readonly categorySlug: DocsCategorySlug;
};
