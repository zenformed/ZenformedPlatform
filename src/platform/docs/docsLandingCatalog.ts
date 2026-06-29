import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsArticleMetricsSnapshot } from '@/platform/docs/docsArticleMetricsTypes';
import { EMPTY_DOCS_ARTICLE_METRICS } from '@/platform/docs/docsArticleMetricsTypes';
import type { DocsPopularLandingArticle, DocsRecentLandingUpdate } from '@/platform/docs/docsLandingTypes';
import type { DocsProductSlug } from '@/platform/docs/docsTypes';
import { docsArticlePath } from '@/platform/docs/docsTypes';

const RECENT_LANDING_LIMIT = 5;
export const POPULAR_LANDING_LIMIT = 6;

const PRODUCT_ACCENT_COLORS: Record<DocsProductSlug, string> = {
  buildcore: '#2563eb',
};

function resolveArticleMetrics(
  article: DocsArticle,
  metricsByArticleId: ReadonlyMap<string, DocsArticleMetricsSnapshot>,
): DocsArticleMetricsSnapshot {
  if (article.databaseId == null) {
    return EMPTY_DOCS_ARTICLE_METRICS;
  }

  return metricsByArticleId.get(article.databaseId) ?? EMPTY_DOCS_ARTICLE_METRICS;
}

export function compareDocsArticlesByPopularity(
  left: DocsArticle,
  right: DocsArticle,
  metricsByArticleId: ReadonlyMap<string, DocsArticleMetricsSnapshot>,
): number {
  const leftMetrics = resolveArticleMetrics(left, metricsByArticleId);
  const rightMetrics = resolveArticleMetrics(right, metricsByArticleId);

  if (leftMetrics.helpfulYes !== rightMetrics.helpfulYes) {
    return rightMetrics.helpfulYes - leftMetrics.helpfulYes;
  }

  if (leftMetrics.views !== rightMetrics.views) {
    return rightMetrics.views - leftMetrics.views;
  }

  return right.lastUpdated.localeCompare(left.lastUpdated);
}

export function sortDocsArticlesByPopularity(
  articles: readonly DocsArticle[],
  metricsByArticleId: ReadonlyMap<string, DocsArticleMetricsSnapshot>,
): readonly DocsArticle[] {
  return [...articles].sort((left, right) =>
    compareDocsArticlesByPopularity(left, right, metricsByArticleId),
  );
}

export function sortDocsArticlesByLastUpdatedDesc(
  articles: readonly DocsArticle[],
): readonly DocsArticle[] {
  return [...articles].sort((left, right) => right.lastUpdated.localeCompare(left.lastUpdated));
}

export function buildPopularDocsLandingArticles(
  articles: readonly DocsArticle[],
  options?: {
    readonly limit?: number;
    readonly metricsByArticleId?: ReadonlyMap<string, DocsArticleMetricsSnapshot>;
  },
): readonly DocsPopularLandingArticle[] {
  const limit = options?.limit ?? POPULAR_LANDING_LIMIT;
  const metricsByArticleId = options?.metricsByArticleId ?? new Map<string, DocsArticleMetricsSnapshot>();
  const rankedArticles = sortDocsArticlesByPopularity(articles, metricsByArticleId);

  return rankedArticles.slice(0, limit).map((article) => {
    const metrics = resolveArticleMetrics(article, metricsByArticleId);
    return {
      id: article.databaseId ?? article.id,
      title: article.title,
      href: docsArticlePath(article.product, article.category, article.slug),
      helpfulYes: metrics.helpfulYes,
      helpfulNo: metrics.helpfulNo,
    };
  });
}

export function buildRecentDocsLandingUpdates(
  articles: readonly DocsArticle[],
  options: {
    readonly limit?: number;
    readonly resolveProductName: (product: DocsProductSlug) => string | undefined;
  },
): readonly DocsRecentLandingUpdate[] {
  const limit = options.limit ?? RECENT_LANDING_LIMIT;
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
