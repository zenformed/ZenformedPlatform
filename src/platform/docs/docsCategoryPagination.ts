import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { docsCategoryPath } from '@/platform/docs/docsTypes';

export const DOCS_CATEGORY_ARTICLES_PER_PAGE = 5;

export type DocsCategoryPaginationResult<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
};

export function parseDocsCategoryPageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw?.trim() ?? '1', 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function paginateDocsCategoryArticles<T>(
  items: readonly T[],
  page: number,
  pageSize: number = DOCS_CATEGORY_ARTICLES_PER_PAGE,
): DocsCategoryPaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const start = (normalizedPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: normalizedPage,
    pageSize,
    totalItems,
    totalPages,
  };
}

export function docsCategoryPagePath(
  product: DocsProductSlug,
  category: DocsCategorySlug,
  page?: number,
): string {
  const path = docsCategoryPath(product, category);

  if (page == null || page <= 1) {
    return path;
  }

  return `${path}?page=${page}`;
}
