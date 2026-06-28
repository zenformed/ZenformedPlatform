import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsArticleRef } from '@/platform/docs/docsArticleTypes';
import { docsArticlePath } from '@/platform/docs/docsTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsArticlePaginationProps = {
  readonly previousArticle?: DocsArticleRef;
  readonly nextArticle?: DocsArticleRef;
};

export function DocsArticlePagination({
  previousArticle,
  nextArticle,
}: DocsArticlePaginationProps): ReactElement | null {
  if (previousArticle == null && nextArticle == null) {
    return null;
  }

  return (
    <nav className={styles.docsArticlePagination} aria-label="Article pagination">
      {previousArticle != null ? (
        <Link
          href={docsArticlePath(
            previousArticle.product,
            previousArticle.category,
            previousArticle.slug,
          )}
          className={styles.docsArticlePaginationLink}
        >
          <span className={styles.docsArticlePaginationLabel}>Previous Article</span>
          <span className={styles.docsArticlePaginationTitle}>{previousArticle.title}</span>
        </Link>
      ) : (
        <span className={styles.docsArticlePaginationPlaceholder} aria-hidden />
      )}
      {nextArticle != null ? (
        <Link
          href={docsArticlePath(nextArticle.product, nextArticle.category, nextArticle.slug)}
          className={`${styles.docsArticlePaginationLink} ${styles.docsArticlePaginationLinkNext}`}
        >
          <span className={styles.docsArticlePaginationLabel}>Next Article</span>
          <span className={styles.docsArticlePaginationTitle}>{nextArticle.title}</span>
        </Link>
      ) : (
        <span className={styles.docsArticlePaginationPlaceholder} aria-hidden />
      )}
    </nav>
  );
}
