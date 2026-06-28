import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsPopularLandingArticle, DocsRecentLandingUpdate } from '@/platform/docs/docsLandingTypes';
import type { DocsProductSlug } from '@/platform/docs/docsTypes';
import { docsArticlePath } from '@/platform/docs/docsTypes';

const DEFAULT_LANDING_LIMIT = 5;

const PRODUCT_ACCENT_COLORS: Record<DocsProductSlug, string> = {
  buildcore: '#2563eb',
};

export function sortDocsArticlesByLastUpdatedDesc(
  articles: readonly DocsArticle[],
): readonly DocsArticle[] {
  return [...articles].sort((left, right) => right.lastUpdated.localeCompare(left.lastUpdated));
}

export function buildPopularDocsLandingArticles(
  articles: readonly DocsArticle[],
  options?: {
    readonly limit?: number;
    readonly resolveProductName?: (product: DocsProductSlug) => string | undefined;
  },
): readonly DocsPopularLandingArticle[] {
  const limit = options?.limit ?? DEFAULT_LANDING_LIMIT;
  return sortDocsArticlesByLastUpdatedDesc(articles).slice(0, limit).map((article) => ({
    id: article.databaseId ?? article.id,
    title: article.title,
    href: docsArticlePath(article.product, article.category, article.slug),
  }));
}

export function buildRecentDocsLandingUpdates(
  articles: readonly DocsArticle[],
  options: {
    readonly limit?: number;
    readonly resolveProductName: (product: DocsProductSlug) => string | undefined;
  },
): readonly DocsRecentLandingUpdate[] {
  const limit = options.limit ?? DEFAULT_LANDING_LIMIT;
  return sortDocsArticlesByLastUpdatedDesc(articles).slice(0, limit).map((article) => ({
    id: article.databaseId ?? article.id,
    productSlug: article.product,
    productLabel: options.resolveProductName(article.product) ?? article.product,
    title: article.title,
    href: docsArticlePath(article.product, article.category, article.slug),
    updatedAt: article.lastUpdated,
    accentColor: PRODUCT_ACCENT_COLORS[article.product] ?? '#64748b',
  }));
}

export function formatDocsLandingUpdateDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
