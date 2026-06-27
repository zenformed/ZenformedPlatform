import type { ReactElement } from 'react';
import styles from '../../../../app/docs/docs.module.css';

export function DocsHero(): ReactElement {
  return (
    <section className={styles.docsHero} aria-labelledby="docs-hero-title">
      <h1 id="docs-hero-title" className={styles.docsHeroTitle}>
        Zenformed <span className={styles.docsHeroAccent}>Docs</span>
      </h1>
      <p className={styles.docsHeroIntro}>
        Find guides, references, and answers across all Zenformed products.
      </p>
      <div className={styles.docsSearchWrap}>
        <input
          type="search"
          className={styles.docsSearchInput}
          placeholder="Search documentation…"
          aria-label="Search documentation"
          disabled
        />
        <span className={styles.docsSearchHint} aria-hidden>
          ⌘ K
        </span>
      </div>
    </section>
  );
}
