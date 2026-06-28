import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsArticleRef } from '@/platform/docs/docsArticleTypes';
import { docsArticlePath } from '@/platform/docs/docsTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsRelatedArticlesProps = {
  readonly articles: readonly DocsArticleRef[];
};

export function DocsRelatedArticles({ articles }: DocsRelatedArticlesProps): ReactElement | null {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className={styles.docsRelatedArticles} aria-labelledby="docs-related-articles-title">
      <h2 id="docs-related-articles-title" className={styles.docsRelatedArticlesTitle}>
        Related Articles
      </h2>
      <ul className={styles.docsRelatedArticlesList}>
        {articles.map((article) => (
          <li key={`${article.product}-${article.category}-${article.slug}`}>
            <Link
              href={docsArticlePath(article.product, article.category, article.slug)}
              className={styles.docsRelatedArticlesLink}
            >
              {article.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
