import type { ReactElement } from 'react';
import styles from '../../../../app/docs/docs.module.css';

export type DocsSearchProps = {
  readonly placeholder?: string;
  readonly ariaLabel?: string;
};

export function DocsSearch({
  placeholder = 'Search documentation…',
  ariaLabel = 'Search documentation',
}: DocsSearchProps): ReactElement {
  return (
    <div className={styles.docsSearchWrap}>
      <input
        type="search"
        className={styles.docsSearchInput}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled
      />
      <span className={styles.docsSearchHint} aria-hidden>
        ⌘ K
      </span>
    </div>
  );
}
