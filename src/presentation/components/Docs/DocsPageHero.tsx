import type { ReactElement, ReactNode } from 'react';
import { DocsSearch } from '@/presentation/components/Docs/DocsSearch';
import styles from '../../../../app/docs/docs.module.css';

export type DocsPageHeroProps = {
  readonly title: string;
  readonly titleAccent?: string;
  readonly subtitle: string;
  readonly searchPlaceholder?: string;
  readonly titleLeading?: ReactNode;
};

export function DocsPageHero({
  title,
  titleAccent,
  subtitle,
  searchPlaceholder,
  titleLeading,
}: DocsPageHeroProps): ReactElement {
  const hasLeading = titleLeading != null;

  return (
    <section className={styles.docsHero} aria-labelledby="docs-page-hero-title">
      <h1
        id="docs-page-hero-title"
        className={hasLeading ? `${styles.docsHeroTitle} ${styles.docsHeroTitleWithIcon}` : styles.docsHeroTitle}
      >
        {titleLeading}
        <span className={styles.docsHeroTitleText}>
          {title}
          {titleAccent != null && titleAccent !== '' ? (
            <>
              {' '}
              <span className={styles.docsHeroAccent}>{titleAccent}</span>
            </>
          ) : null}
        </span>
      </h1>
      <p className={styles.docsHeroIntro}>{subtitle}</p>
      <DocsSearch placeholder={searchPlaceholder} />
    </section>
  );
}
