'use client';

import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { normalizeDocsSearchQuery } from '@/platform/docs/docsSearchAnalytics';
import {
  DOCS_SEARCH_SESSION_STORAGE_KEY,
  docsSearchEventSessionStorageKey,
} from '@/platform/docs/docsSearchAnalyticsTypes';
import type { DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsSearchAnalyticsContextValue = {
  readonly searchEventId: string | null;
  readonly recordResultClick: (articleId: string | undefined) => void;
};

export type DocsSearchAnalyticsProviderProps = {
  readonly query: string;
  readonly resultsCount: number;
  readonly productSlug?: DocsProductSlug;
  readonly children: (context: DocsSearchAnalyticsContextValue) => ReactNode;
};

function readDocsSearchSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let sessionId = window.sessionStorage.getItem(DOCS_SEARCH_SESSION_STORAGE_KEY);
  if (sessionId == null || sessionId.trim() === '') {
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(DOCS_SEARCH_SESSION_STORAGE_KEY, sessionId);
  }

  return sessionId;
}

export async function logDocsSearchEventClient(input: {
  readonly query: string;
  readonly resultsCount: number;
  readonly productSlug?: DocsProductSlug;
}): Promise<string | null> {
  const normalizedQuery = normalizeDocsSearchQuery(input.query);
  if (normalizedQuery.length === 0) {
    return null;
  }

  const storageKey = docsSearchEventSessionStorageKey(normalizedQuery, input.productSlug ?? null);
  const existingEventId = window.sessionStorage.getItem(storageKey);
  if (existingEventId != null && existingEventId.trim() !== '') {
    return existingEventId;
  }

  try {
    const response = await fetch('/api/docs/search/events', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: input.query.trim(),
        product: input.productSlug ?? null,
        resultsCount: input.resultsCount,
        sessionId: readDocsSearchSessionId(),
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { searchEventId?: string };
    const searchEventId = payload.searchEventId?.trim() ?? '';
    if (searchEventId === '') {
      return null;
    }

    window.sessionStorage.setItem(storageKey, searchEventId);
    return searchEventId;
  } catch {
    return null;
  }
}

export function recordDocsSearchClickClient(
  searchEventId: string | null,
  articleId: string | undefined,
): void {
  const trimmedArticleId = articleId?.trim() ?? '';
  const trimmedEventId = searchEventId?.trim() ?? '';

  if (trimmedArticleId === '' || trimmedEventId === '') {
    return;
  }

  void fetch('/api/docs/search/clicks', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      searchEventId: trimmedEventId,
      articleId: trimmedArticleId,
    }),
  }).catch(() => {
    // Click tracking is best-effort; ignore client errors.
  });
}

export function DocsSearchAnalyticsProvider({
  query,
  resultsCount,
  productSlug,
  children,
}: DocsSearchAnalyticsProviderProps): ReactElement {
  const [searchEventId, setSearchEventId] = useState<string | null>(null);

  useEffect(() => {
    const normalizedQuery = normalizeDocsSearchQuery(query);
    if (normalizedQuery.length === 0 || typeof window === 'undefined') {
      return;
    }

    const storageKey = docsSearchEventSessionStorageKey(normalizedQuery, productSlug ?? null);
    const existingEventId = window.sessionStorage.getItem(storageKey);
    if (existingEventId != null && existingEventId.trim() !== '') {
      setSearchEventId(existingEventId);
      return;
    }

    void logDocsSearchEventClient({
      query,
      resultsCount,
      productSlug,
    }).then((eventId) => {
      if (eventId != null) {
        setSearchEventId(eventId);
      }
    });
  }, [productSlug, query, resultsCount]);

  const recordResultClick = (articleId: string | undefined): void => {
    recordDocsSearchClickClient(searchEventId, articleId);
  };

  return <>{children({ searchEventId, recordResultClick })}</>;
}
