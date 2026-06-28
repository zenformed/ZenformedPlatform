import type { ReactElement } from 'react';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsArticleMetadataProps = {
  readonly article: DocsArticle;
  readonly categoryTitle: string;
};

export function DocsArticleMetadata({
  article,
  categoryTitle,
}: DocsArticleMetadataProps): ReactElement {
  return (
    <dl className={styles.docsArticleMetadata}>
      <div className={styles.docsArticleMetadataItem}>
        <dt className={styles.docsArticleMetadataLabel}>Last Updated</dt>
        <dd className={styles.docsArticleMetadataValue}>
          <time dateTime={article.lastUpdated}>{formatDisplayDate(article.lastUpdated)}</time>
        </dd>
      </div>
      <div className={styles.docsArticleMetadataItem}>
        <dt className={styles.docsArticleMetadataLabel}>Estimated Read Time</dt>
        <dd className={styles.docsArticleMetadataValue}>{article.estimatedReadTime}</dd>
      </div>
      <div className={styles.docsArticleMetadataItem}>
        <dt className={styles.docsArticleMetadataLabel}>Category</dt>
        <dd className={styles.docsArticleMetadataValue}>{categoryTitle}</dd>
      </div>
    </dl>
  );
}

function formatDisplayDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
