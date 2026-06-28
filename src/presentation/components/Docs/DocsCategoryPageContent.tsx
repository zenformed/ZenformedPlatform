import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsCategory, DocsProduct } from '@/platform/docs/docsTypes';
import { docsProductPath } from '@/platform/docs/docsTypes';
import { DocsBreadcrumbs } from '@/presentation/components/Docs/DocsBreadcrumbs';
import styles from '../../../../app/docs/docs.module.css';

export type DocsCategoryPageContentProps = {
  readonly product: DocsProduct;
  readonly category: DocsCategory;
};

export function DocsCategoryPageContent({
  product,
  category,
}: DocsCategoryPageContentProps): ReactElement {
  return (
    <article className={styles.docsCategoryPage}>
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
      <p className={styles.docsComingSoon} role="status">
        Articles coming soon.
      </p>
      <p className={styles.docsBackLinkWrap}>
        <Link href={docsProductPath(product.slug)} className={styles.docsBackLink}>
          ← Back to {product.name} Documentation
        </Link>
      </p>
    </article>
  );
}
