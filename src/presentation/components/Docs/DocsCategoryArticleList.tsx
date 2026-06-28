import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { docsArticlePath } from '@/platform/docs/docsTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsCategoryArticleListProps = {
  readonly productSlug: DocsProductSlug;
  readonly categorySlug: DocsCategorySlug;
  readonly articles: readonly DocsArticle[];
};

export function DocsCategoryArticleList({
  productSlug,
  categorySlug,
  articles,
}: DocsCategoryArticleListProps): ReactElement | null {
  if (articles.length === 0) {
    return null;
  }

  return (
    <ul className={styles.docsCategoryArticleList}>
      {articles.map((article) => (
        <li key={article.id} className={styles.docsCategoryArticleItem}>
          <Link
            href={docsArticlePath(productSlug, categorySlug, article.slug)}
            className={styles.docsCategoryArticleCard}
          >
            <h2 className={styles.docsCategoryArticleTitle}>{article.title}</h2>
            {article.summary != null && article.summary.trim() !== '' ? (
              <p className={styles.docsCategoryArticleSummary}>{article.summary}</p>
            ) : null}
            <div className={styles.docsCategoryArticleMeta}>
              <span>{article.estimatedReadTime}</span>
              <span>Updated {article.lastUpdated}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
