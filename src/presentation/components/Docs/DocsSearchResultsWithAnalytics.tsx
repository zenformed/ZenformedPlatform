'use client';

import type { ReactElement } from 'react';
import type { DocsPublicSearchResult } from '@/platform/docs/docsPublicArticleSearch';
import type { DocsProductSlug } from '@/platform/docs/docsTypes';
import { DocsSearchAnalyticsProvider } from '@/presentation/components/Docs/DocsSearchAnalytics';
import { DocsSearchResults } from '@/presentation/components/Docs/DocsSearchResults';

export type DocsSearchResultsWithAnalyticsProps = {
  readonly query: string;
  readonly results: readonly DocsPublicSearchResult[];
  readonly productSlug?: DocsProductSlug;
};

export function DocsSearchResultsWithAnalytics({
  query,
  results,
  productSlug,
}: DocsSearchResultsWithAnalyticsProps): ReactElement {
  return (
    <DocsSearchAnalyticsProvider
      query={query}
      resultsCount={results.length}
      productSlug={productSlug}
    >
      {({ recordResultClick }) => (
        <DocsSearchResults query={query} results={results} onResultClick={recordResultClick} />
      )}
    </DocsSearchAnalyticsProvider>
  );
}
