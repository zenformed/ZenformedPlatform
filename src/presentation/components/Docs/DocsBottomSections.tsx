import Link from 'next/link';
import type { ReactElement } from 'react';
import {
  formatDocsLandingUpdateDate,
} from '@/platform/docs/docsLandingCatalog';
import type {
  DocsPopularLandingArticle,
  DocsRecentLandingUpdate,
} from '@/platform/docs/docsLandingTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsBottomSectionsProps = {
  readonly popularArticles: readonly DocsPopularLandingArticle[];
  readonly recentUpdates: readonly DocsRecentLandingUpdate[];
};

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

function HelpfulUpIcon(): ReactElement {
  return (
    <svg
      className={styles.docsPopularVoteIcon}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 12.5V4.5M8 4.5 5.25 7.25M8 4.5 10.75 7.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpfulDownIcon(): ReactElement {
  return (
    <svg
      className={styles.docsPopularVoteIcon}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M8 3.5v8M8 11.5 5.25 8.75M8 11.5 10.75 8.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocsBottomSections({
  popularArticles,
  recentUpdates,
}: DocsBottomSectionsProps): ReactElement {
  return (
    <div className={styles.docsBottomLayout}>
      <div className={styles.docsPanels}>
        <section className={styles.docsPanel} aria-labelledby="docs-recent-updates-title">
          <h2 id="docs-recent-updates-title" className={styles.docsPanelTitle}>
            Recent Updates
          </h2>
          {recentUpdates.length === 0 ? (
            <p className={styles.docsPanelEmpty}>No published documentation updates yet.</p>
          ) : (
            <ul className={styles.docsUpdateList}>
              {recentUpdates.map((update) => (
                <li key={update.id} className={styles.docsUpdateItem}>
                  <span
                    className={styles.docsUpdateDot}
                    style={{ backgroundColor: update.accentColor }}
                    aria-hidden
                  />
                  <div className={styles.docsUpdateContent}>
                    <span className={styles.docsUpdateProduct}>{update.productLabel}</span>
                    <p className={styles.docsUpdateTitle}>
                      <Link href={update.href} className={styles.docsUpdateLink}>
                        {update.title}
                      </Link>
                    </p>
                  </div>
                  <time className={styles.docsUpdateDate} dateTime={update.updatedAt}>
                    {formatDocsLandingUpdateDate(update.updatedAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.docsPanel} aria-labelledby="docs-popular-articles-title">
          <h2 id="docs-popular-articles-title" className={styles.docsPanelTitle}>
            Popular Articles
          </h2>
          {popularArticles.length === 0 ? (
            <p className={styles.docsPanelEmpty}>No published articles yet.</p>
          ) : (
            <ul className={styles.docsArticleList}>
              {popularArticles.map((article) => (
                <li key={article.id} className={styles.docsArticleItem}>
                  <Link href={article.href} className={styles.docsArticleLink}>
                    <span className={styles.docsPopularArticleMain}>
                      <span
                        className={styles.docsPopularArticleVotes}
                        aria-label={`${article.helpfulYes} found helpful, ${article.helpfulNo} not helpful`}
                      >
                        <span className={styles.docsPopularVoteGroup}>
                          <span className={styles.docsPopularVoteIconWrap} title="Helpful votes">
                            <HelpfulUpIcon />
                          </span>
                          <span
                            className={`${styles.docsPopularVoteCount} ${styles.docsPopularVoteCountUp}`}
                          >
                            {article.helpfulYes}
                          </span>
                        </span>
                        <span className={styles.docsPopularVoteGroup}>
                          <span className={styles.docsPopularVoteIconWrap} title="Not helpful votes">
                            <HelpfulDownIcon />
                          </span>
                          <span
                            className={`${styles.docsPopularVoteCount} ${styles.docsPopularVoteCountDown}`}
                          >
                            {article.helpfulNo}
                          </span>
                        </span>
                      </span>
                      <span className={styles.docsPopularArticleTitle}>{article.title}</span>
                    </span>
                    <ArticleArrowIcon />
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
