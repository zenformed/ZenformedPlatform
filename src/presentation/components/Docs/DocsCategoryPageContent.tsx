import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsArticle } from '@/platform/docs/docsArticleTypes';
import type { DocsCategory, DocsProduct } from '@/platform/docs/docsTypes';
import { docsProductPath } from '@/platform/docs/docsTypes';
import { DocsBreadcrumbs } from '@/presentation/components/Docs/DocsBreadcrumbs';
import { DocsCategoryArticleList } from '@/presentation/components/Docs/DocsCategoryArticleList';
import { DocsSearch } from '@/presentation/components/Docs/DocsSearch';
import styles from '../../../../app/docs/docs.module.css';
export type DocsCategoryPageContentProps = {
  readonly product: DocsProduct;
  readonly category: DocsCategory;
  readonly articles: readonly DocsArticle[];
};

export function DocsCategoryPageContent({
  product,
  category,
  articles,
}: DocsCategoryPageContentProps): ReactElement {
  return (
    <article className={styles.docsCategoryPage}>
      <DocsSearch
        variant="inline"
        productSlug={product.slug}
        categorySlug={category.slug}
        placeholder={`Search ${category.title} documentation…`}
      />
      <DocsBreadcrumbs
        items={[
          { label: product.name, href: docsProductPath(product.slug) },
          { label: category.title },
        ]}
      />
      <header className={styles.docsCategoryPageHeader}>
        <h1 className={styles.docsCategoryPageTitle}>{category.title}</h1>
        <p className={styles.docsCategoryPageDescription}>{category.description}</p>
      </header>

      {articles.length > 0 ? (
        <DocsCategoryArticleList
          productSlug={product.slug}
          categorySlug={category.slug}
          articles={articles}
        />
      ) : (
        <p className={styles.docsComingSoon} role="status">
          Articles coming soon.
        </p>
      )}

      <p className={styles.docsBackLinkWrap}>
        <Link href={docsProductPath(product.slug)} className={styles.docsBackLink}>
          ← Back to {product.name} Documentation
        </Link>
      </p>
    </article>
  );
}
