import Link from 'next/link';
import type { ReactElement } from 'react';
import { docsCategoryPagePath } from '@/platform/docs/docsCategoryPagination';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsCategoryPaginationProps = {
  readonly productSlug: DocsProductSlug;
  readonly categorySlug: DocsCategorySlug;
  readonly page: number;
  readonly totalPages: number;
};

export function DocsCategoryPagination({
  productSlug,
  categorySlug,
  page,
  totalPages,
}: DocsCategoryPaginationProps): ReactElement | null {
  if (totalPages <= 1) {
    return null;
  }

  const previousHref =
    page > 1 ? docsCategoryPagePath(productSlug, categorySlug, page - 1) : undefined;
  const nextHref =
    page < totalPages ? docsCategoryPagePath(productSlug, categorySlug, page + 1) : undefined;

  return (
    <nav className={styles.docsCategoryPagination} aria-label="Category articles pagination">
      {previousHref != null ? (
        <Link href={previousHref} className={styles.docsCategoryPaginationLink}>
          Previous
        </Link>
      ) : (
        <span className={styles.docsCategoryPaginationLinkDisabled} aria-hidden="true">
          Previous
        </span>
      )}

      <span className={styles.docsCategoryPaginationStatus} role="status">
        Page {page} of {totalPages}
      </span>

      {nextHref != null ? (
        <Link href={nextHref} className={styles.docsCategoryPaginationLink}>
          Next
        </Link>
      ) : (
        <span className={styles.docsCategoryPaginationLinkDisabled} aria-hidden="true">
          Next
        </span>
      )}
    </nav>
  );
}
