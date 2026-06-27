import Link from 'next/link';
import type { ReactElement } from 'react';
import {
  DOCS_POPULAR_ARTICLES,
  DOCS_RECENT_UPDATES,
} from '@/platform/content/docsLandingContent';
import styles from '../../../../app/docs/docs.module.css';

function ArticleArrowIcon(): ReactElement {
  return (
    <svg
      className={styles.docsArticleArrow}
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocsBottomSections(): ReactElement {
  return (
    <div className={styles.docsBottomLayout}>
      <div className={styles.docsPanels}>
        <section className={styles.docsPanel} aria-labelledby="docs-recent-updates-title">
          <h2 id="docs-recent-updates-title" className={styles.docsPanelTitle}>
            Recent Updates
          </h2>
          <ul className={styles.docsUpdateList}>
            {DOCS_RECENT_UPDATES.map((update) => (
              <li key={update.id} className={styles.docsUpdateItem}>
                <span
                  className={styles.docsUpdateDot}
                  style={{ backgroundColor: update.accentColor }}
                  aria-hidden
                />
                <div className={styles.docsUpdateContent}>
                  <span className={styles.docsUpdateProduct}>{update.productLabel}</span>
                  <p className={styles.docsUpdateTitle}>{update.title}</p>
                </div>
                <time className={styles.docsUpdateDate} dateTime={update.date}>
                  {update.date}
                </time>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.docsPanel} aria-labelledby="docs-popular-articles-title">
          <h2 id="docs-popular-articles-title" className={styles.docsPanelTitle}>
            Popular Articles
          </h2>
          <ul className={styles.docsArticleList}>
            {DOCS_POPULAR_ARTICLES.map((article) => (
              <li key={article.id} className={styles.docsArticleItem}>
                <Link href={article.href} className={styles.docsArticleLink}>
                  <span>{article.title}</span>
                  <ArticleArrowIcon />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.docsCtaBar} aria-label="Documentation support">
        <p className={styles.docsCtaText}>
          Can&apos;t find what you&apos;re looking for? Ask our AI assistant or contact support.
        </p>
        <div className={styles.docsCtaActions}>
          <button type="button" className={styles.docsCtaButton} disabled>
            Ask AI Assistant
          </button>
          <button type="button" className={styles.docsCtaButtonSecondary} disabled>
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
}
