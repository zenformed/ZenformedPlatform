import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsPublicSearchResult } from '@/platform/docs/docsPublicArticleSearch';
import type { DocsCategory, DocsProduct } from '@/platform/docs/docsTypes';
import { docsHubPath, docsProductPath } from '@/platform/docs/docsTypes';
import { DocsBreadcrumbs } from '@/presentation/components/Docs/DocsBreadcrumbs';
import { DocsSearch } from '@/presentation/components/Docs/DocsSearch';
import { DocsSearchResultsWithAnalytics } from '@/presentation/components/Docs/DocsSearchResultsWithAnalytics';
import styles from '../../../../app/docs/docs.module.css';

export type DocsSearchPageContentProps = {
  readonly query: string;
  readonly results: readonly DocsPublicSearchResult[];
  readonly product?: DocsProduct;
  readonly category?: DocsCategory;
};

export function DocsSearchPageContent({
  query,
  results,
  product,
  category,
}: DocsSearchPageContentProps): ReactElement {
  const breadcrumbItems = [{ label: 'Docs', href: docsHubPath() }, { label: 'Search' }];

  const scopeLabel =
    product != null && category != null
      ? `${product.name} / ${category.title}`
      : product != null
        ? product.name
        : null;

  return (
    <section className={styles.docsSearchPage}>
      <DocsBreadcrumbs items={breadcrumbItems} />
      <header className={styles.docsSearchPageHeader}>
        <h1 className={styles.docsSearchPageTitle}>Search documentation</h1>
        {scopeLabel != null ? (
          <p className={styles.docsSearchPageScope}>Searching in {scopeLabel}</p>
        ) : (
          <p className={styles.docsSearchPageScope}>Search published documentation across Zenformed.</p>
        )}
      </header>

      <DocsSearch
        defaultQuery={query}
        productSlug={product?.slug}
        categorySlug={category?.slug}
        placeholder={
          product != null
            ? `Search ${product.name} documentation…`
            : 'Search documentation…'
        }
      />

      {query.trim() !== '' ? (
        <p className={styles.docsSearchResultsSummary} role="status">
          {results.length === 1 ? '1 result' : `${results.length} results`} for &ldquo;{query}&rdquo;
        </p>
      ) : null}

      {query.trim() !== '' ? (
        <DocsSearchResultsWithAnalytics
          query={query}
          results={results}
          productSlug={product?.slug}
        />
      ) : (
        <p className={styles.docsSearchEmptyState}>Enter a search term to find documentation articles.</p>
      )}

      {product != null ? (
        <p className={styles.docsBackLinkWrap}>
          <Link href={docsProductPath(product.slug)} className={styles.docsBackLink}>
            ← Back to {product.name} Documentation
          </Link>
        </p>
      ) : null}
    </section>
  );
}
