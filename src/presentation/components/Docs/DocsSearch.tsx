'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { docsSearchPath } from '@/platform/docs/docsSearchPaths';
import type { DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import styles from '../../../../app/docs/docs.module.css';

export type DocsSearchProps = {
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly defaultQuery?: string;
  readonly productSlug?: DocsProductSlug;
  readonly categorySlug?: DocsCategorySlug;
  readonly variant?: 'hero' | 'inline';
};

function DocsSearchIcon(): ReactElement {
  return (
    <svg
      className={styles.docsSearchSubmitIcon}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DocsSearch({
  placeholder = 'Search documentation…',
  ariaLabel = 'Search documentation',
  defaultQuery = '',
  productSlug,
  categorySlug,
  variant = 'hero',
}: DocsSearchProps): ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  const submitSearch = useCallback(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery === '') {
      return;
    }

    router.push(
      docsSearchPath({
        q: trimmedQuery,
        product: productSlug,
        category: categorySlug,
      }),
    );
  }, [categorySlug, productSlug, query, router]);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    submitSearch();
  };

  const wrapClassName =
    variant === 'inline'
      ? `${styles.docsSearchWrap} ${styles.docsSearchWrapInline}`
      : styles.docsSearchWrap;

  return (
    <form className={wrapClassName} onSubmit={onSubmit} role="search">
      <input
        type="search"
        className={styles.docsSearchInput}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        data-docs-search-input
      />
      <button type="submit" className={styles.docsSearchSubmit} aria-label="Search">
        <DocsSearchIcon />
      </button>
      <span className={styles.docsSearchHint} aria-hidden>
        ⌘ K
      </span>
    </form>
  );
}
