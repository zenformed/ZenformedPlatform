import 'server-only';

import { revalidatePath } from 'next/cache';
import { DOCS_ADMIN_PLACEHOLDER_ARTICLES } from '@/platform/docs/docsAdminCatalogData';
import type { DocsAdminArticle } from '@/platform/docs/docsAdminTypes';
import { loadDocsAdminArticlesFromDatabase } from '@/platform/docs/docsArticleRepository.server';
import { canUseDocsDatabaseSource, isDocsDatabaseContentSource } from '@/platform/docs/docsContentSource';
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

export async function loadDocsAdminArticles(): Promise<readonly DocsAdminArticle[]> {
  if (isDocsDatabaseContentSource()) {
    if (canUseDocsDatabaseSource()) {
      return mergeAdminArticles(await loadDocsAdminArticlesFromDatabase());
    }

    console.warn(
      '[docs] DOCS_CONTENT_SOURCE=database but Supabase service role credentials are missing; admin catalog is falling back to markdown files.',
    );
  }

  return mergeAdminArticles(getDocsAdminMarkdownArticles());
}
