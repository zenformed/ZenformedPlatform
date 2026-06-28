import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsArticleVisibility = 'public' | 'authenticated' | 'staff' | 'organization';

export type DocsArticleRef = {
  readonly slug: string;
  readonly title: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
};

export type DocsArticle = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary?: string;
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly visibility: DocsArticleVisibility;
  readonly tags: readonly string[];
  readonly estimatedReadTime: string;
  readonly lastUpdated: string;
  readonly author: string;
  readonly relatedArticles: readonly DocsArticleRef[];
  readonly previousArticle?: DocsArticleRef;
  readonly nextArticle?: DocsArticleRef;
  readonly content: string;
};

export type DocsArticleRouteParams = {
  readonly product: DocsProductSlug;
  readonly category: DocsCategorySlug;
  readonly slug: string;
};
