import type { DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsSearchEventRecord = {
  readonly query: string;
  readonly normalizedQuery: string;
  readonly product: DocsProductSlug | null;
  readonly resultsCount: number;
  readonly sessionId: string | null;
  readonly userId: string | null;
  readonly organizationId: string | null;
};

export type RecordDocsSearchEventInput = {
  readonly query: string;
  readonly product?: DocsProductSlug | null;
  readonly resultsCount: number;
  readonly sessionId?: string | null;
  readonly userId?: string | null;
  readonly organizationId?: string | null;
};

export const DOCS_SEARCH_SESSION_STORAGE_KEY = 'zenformed.docs.searchSessionId';

export function docsSearchEventSessionStorageKey(
  normalizedQuery: string,
  product: DocsProductSlug | null | undefined,
): string {
  return `zenformed.docs.searchEvent.${product ?? 'all'}.${normalizedQuery}`;
}
