import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';

export type DocsSearchPathParams = {
  readonly q?: string;
  readonly product?: DocsProductSlug;
  readonly category?: DocsCategorySlug;
};

export function docsSearchPath(params: DocsSearchPathParams = {}): string {
  const searchParams = new URLSearchParams();
  const query = params.q?.trim();

  if (query != null && query !== '') {
    searchParams.set('q', query);
  }

  if (params.product != null) {
    searchParams.set('product', params.product);
  }

  if (params.category != null) {
    searchParams.set('category', params.category);
  }

  const queryString = searchParams.toString();
  return queryString === '' ? '/docs/search' : `/docs/search?${queryString}`;
}
