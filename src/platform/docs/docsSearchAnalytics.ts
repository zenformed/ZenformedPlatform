import type { DocsProductSlug } from '@/platform/docs/docsTypes';
import type { DocsSearchEventRecord, RecordDocsSearchEventInput } from '@/platform/docs/docsSearchAnalyticsTypes';

export function normalizeDocsSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isDocsSearchQueryLoggable(query: string): boolean {
  return normalizeDocsSearchQuery(query).length > 0;
}

export function buildDocsSearchEventRecord(
  input: RecordDocsSearchEventInput,
): DocsSearchEventRecord | null {
  const normalizedQuery = normalizeDocsSearchQuery(input.query);
  if (normalizedQuery.length === 0) {
    return null;
  }

  if (input.resultsCount < 0 || !Number.isInteger(input.resultsCount)) {
    throw new Error('resultsCount must be a non-negative integer.');
  }

  return {
    query: input.query.trim(),
    normalizedQuery,
    product: input.product ?? null,
    resultsCount: input.resultsCount,
    sessionId: input.sessionId ?? null,
    userId: input.userId ?? null,
    organizationId: input.organizationId ?? null,
  };
}

export function resolveDocsSearchEventProduct(
  product: string | null | undefined,
): DocsProductSlug | null {
  const trimmed = product?.trim();
  if (trimmed === 'buildcore') {
    return 'buildcore';
  }

  return null;
}
