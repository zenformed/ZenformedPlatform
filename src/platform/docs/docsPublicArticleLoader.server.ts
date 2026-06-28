import 'server-only';

import { cache } from 'react';
import { loadDocsArticlesFromMarkdown } from '@/platform/docs/docsMarkdownLoader';
import { loadPublishedPublicDocsArticlesFromDatabase } from '@/platform/docs/docsArticleRepository.server';
import { canUseDocsDatabaseSource } from '@/platform/docs/docsContentSource';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';

let warnedDatabaseFallback = false;

export const loadPublicDocsArticles = cache(async (): Promise<readonly DocsArticle[]> => {
  if (canUseDocsDatabaseSource()) {
    return loadPublishedPublicDocsArticlesFromDatabase();
  }

  if (
    process.env.DOCS_CONTENT_SOURCE?.trim().toLowerCase() === 'database' &&
    !warnedDatabaseFallback &&
    process.env.NODE_ENV === 'development'
  ) {
    warnedDatabaseFallback = true;
    console.warn(
      '[docs] DOCS_CONTENT_SOURCE=database but SUPABASE_SERVICE_ROLE_KEY is missing; falling back to markdown files.',
    );
  }

  return loadDocsArticlesFromMarkdown();
});
