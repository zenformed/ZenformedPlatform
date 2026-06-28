import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsCategory, DocsCategorySlug, DocsProductSlug } from '@/platform/docs/docsTypes';
import { docsCategoryPath } from '@/platform/docs/docsTypes';
import { DocsCategoryIcon } from '@/presentation/components/Docs/DocsCategoryIcon';
import styles from '../../../../app/docs/docs.module.css';

export type DocsCategoryGridProps = {
  readonly productSlug: DocsProductSlug;
  readonly categories: readonly DocsCategory[];
  readonly articleCounts?: Readonly<Partial<Record<DocsCategorySlug, number>>>;
};

function formatCategoryAction(count: number | undefined): string {
  if (count == null || count === 0) {
    return 'Browse Articles →';
  }

  return count === 1 ? '1 article →' : `${count} articles →`;
}

export function DocsCategoryGrid({
  productSlug,
  categories,
  articleCounts,
}: DocsCategoryGridProps): ReactElement {
  return (
    <div className={styles.docsCategoryGrid}>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={docsCategoryPath(productSlug, category.slug)}
          className={styles.docsCategoryCard}
        >
          <span className={styles.docsCategoryIconWrap} aria-hidden>
            <DocsCategoryIcon slug={category.slug} />
          </span>
          <h2 className={styles.docsCategoryTitle}>{category.title}</h2>
          <p className={styles.docsCategoryDescription}>{category.description}</p>
          <span className={styles.docsCategoryAction}>
            {formatCategoryAction(articleCounts?.[category.slug])}
          </span>
        </Link>
      ))}
    </div>
  );
}
