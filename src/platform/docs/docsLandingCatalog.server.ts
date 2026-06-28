import 'server-only';

import { getAllDocsArticles } from '@/platform/docs/docsArticleCatalog';
import { loadDocsArticleMetricsMap } from '@/platform/docs/docsArticleRepository.server';
import { canUseDocsDatabaseSource } from '@/platform/docs/docsContentSource';
import { getDocsProduct } from '@/platform/docs/docsCatalog';
import {
  buildPopularDocsLandingArticles,
  buildRecentDocsLandingUpdates,
} from '@/platform/docs/docsLandingCatalog';
import type { DocsPopularLandingArticle, DocsRecentLandingUpdate } from '@/platform/docs/docsLandingTypes';

export async function getPopularDocsLandingArticles(
  limit?: number,
): Promise<readonly DocsPopularLandingArticle[]> {
  const articles = await getAllDocsArticles();
  const databaseArticleIds = articles
    .map((article) => article.databaseId)
    .filter((articleId): articleId is string => articleId != null);

  const metricsByArticleId = canUseDocsDatabaseSource()
    ? await loadDocsArticleMetricsMap(databaseArticleIds)
    : new Map();

  return buildPopularDocsLandingArticles(articles, {
    ...(limit != null ? { limit } : {}),
    metricsByArticleId,
  });
}

export async function getRecentDocsLandingUpdates(limit = 5): Promise<readonly DocsRecentLandingUpdate[]> {
  const articles = await getAllDocsArticles();
  return buildRecentDocsLandingUpdates(articles, {
    limit,
    resolveProductName: (productSlug) => getDocsProduct(productSlug).name,
  });
}
