import 'server-only';

import { cache } from 'react';
import { loadDocsArticlesFromMarkdown } from '@/platform/docs/docsMarkdownLoader';
import { loadPublishedPublicDocsArticlesFromDatabase } from '@/platform/docs/docsArticleRepository.server';
import { isDocsDatabaseContentSource } from '@/platform/docs/docsContentSource';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';

export const loadPublicDocsArticles = cache(async (): Promise<readonly DocsArticle[]> => {
  if (isDocsDatabaseContentSource()) {
    return loadPublishedPublicDocsArticlesFromDatabase();
  }

  return loadDocsArticlesFromMarkdown();
});
