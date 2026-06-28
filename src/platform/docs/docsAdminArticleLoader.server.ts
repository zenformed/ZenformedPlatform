import 'server-only';

import { cache } from 'react';
import { DOCS_ADMIN_PLACEHOLDER_ARTICLES } from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import { loadDocsAdminArticlesFromDatabase } from '@/platform/docs/docsArticleRepository.server';
import { isDocsDatabaseContentSource } from '@/platform/docs/docsContentSource';
import { getDocsAdminMarkdownArticles } from '@/platform/docs/docsAdminCatalog.server';

function mergeAdminArticles(
  primaryArticles: readonly DocsAdminArticle[],
): readonly DocsAdminArticle[] {
  const primaryIdentities = new Set(
    primaryArticles.map((article) => `${article.product}/${article.category}/${article.slug}`),
  );

  const placeholders = DOCS_ADMIN_PLACEHOLDER_ARTICLES.filter((article) => {
    const identity = `${article.product}/${article.category}/${article.slug}`;
    return !primaryIdentities.has(identity);
  }).map((article) => ({
    ...article,
    articleKey: article.editorId,
    source: 'placeholder' as const,
  }));

  return [...primaryArticles, ...placeholders].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}

export const loadDocsAdminArticlesCached = cache(async (): Promise<readonly DocsAdminArticle[]> => {
  if (isDocsDatabaseContentSource()) {
    return mergeAdminArticles(await loadDocsAdminArticlesFromDatabase());
  }

  return mergeAdminArticles(getDocsAdminMarkdownArticles());
});
