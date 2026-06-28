import 'server-only';

import { getAllDocsArticles } from '@/platform/docs/docsArticleCatalog';
import { getDocsProduct } from '@/platform/docs/docsCatalog';
import {
  buildPopularDocsLandingArticles,
  buildRecentDocsLandingUpdates,
} from '@/platform/docs/docsLandingCatalog';
import type { DocsPopularLandingArticle, DocsRecentLandingUpdate } from '@/platform/docs/docsLandingTypes';

export async function getPopularDocsLandingArticles(
  limit = 5,
): Promise<readonly DocsPopularLandingArticle[]> {
  const articles = await getAllDocsArticles();
  return buildPopularDocsLandingArticles(articles, {
    limit,
    resolveProductName: (productSlug) => getDocsProduct(productSlug).name,
  });
}

export async function getRecentDocsLandingUpdates(limit = 5): Promise<readonly DocsRecentLandingUpdate[]> {
  const articles = await getAllDocsArticles();
  return buildRecentDocsLandingUpdates(articles, {
    limit,
    resolveProductName: (productSlug) => getDocsProduct(productSlug).name,
  });
}
