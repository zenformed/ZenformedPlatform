'use client';

import { useEffect, type ReactElement } from 'react';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import { docsArticleViewSessionStorageKey } from '@/platform/docs/docsArticleMetricsTypes';

export type DocsArticleViewTrackerProps = {
  readonly article: Pick<DocsArticle, 'databaseId'>;
};

export function DocsArticleViewTracker({ article }: DocsArticleViewTrackerProps): null {
  useEffect(() => {
    if (article.databaseId == null || typeof window === 'undefined') {
      return;
    }

    const storageKey = docsArticleViewSessionStorageKey(article.databaseId);
    if (window.sessionStorage.getItem(storageKey) === '1') {
      return;
    }

    void fetch('/api/docs/articles/views', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleId: article.databaseId }),
    })
      .then((response) => {
        if (response.ok) {
          window.sessionStorage.setItem(storageKey, '1');
        }
      })
      .catch(() => {
        // View tracking is best-effort; ignore client errors.
      });
  }, [article.databaseId]);

  return null;
}
