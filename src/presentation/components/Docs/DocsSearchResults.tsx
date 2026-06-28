import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsPublicSearchResult } from '@/platform/docs/docsPublicArticleSearch';
import { docsArticlePath } from '@/platform/docs/docsTypes';
import { DocsSearchHighlight } from '@/presentation/components/Docs/DocsSearchHighlight';
import styles from '../../../../app/docs/docs.module.css';

export type DocsSearchResultsProps = {
  readonly query: string;
  readonly results: readonly DocsPublicSearchResult[];
};

export function DocsSearchResults({ query, results }: DocsSearchResultsProps): ReactElement {
  if (results.length === 0) {
    return (
      <p className={styles.docsSearchEmptyState} role="status">
        No documentation articles found.
      </p>
    );
  }

  return (
    <ul className={styles.docsSearchResults}>
      {results.map((result) => (
        <li key={result.article.id} className={styles.docsSearchResultItem}>
          <Link
            href={docsArticlePath(
              result.article.product,
              result.article.category,
              result.article.slug,
            )}
            className={styles.docsSearchResultCard}
          >
            <h2 className={styles.docsSearchResultTitle}>
              <DocsSearchHighlight text={result.article.title} query={query} />
            </h2>
            {result.excerpt.trim() !== '' ? (
              <p className={styles.docsSearchResultExcerpt}>
                <DocsSearchHighlight text={result.excerpt} query={query} />
              </p>
            ) : null}
            <div className={styles.docsSearchResultMeta}>
              <span>
                {result.productName} / {result.categoryTitle}
              </span>
              <span>{result.article.estimatedReadTime}</span>
              <span>Updated {result.article.lastUpdated}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
