import Link from 'next/link';
import type { ReactElement } from 'react';
import type { DocsCategory, DocsProductSlug } from '@/platform/docs/docsTypes';
import { docsCategoryPath } from '@/platform/docs/docsTypes';
import { DocsCategoryIcon } from '@/presentation/components/Docs/DocsCategoryIcon';
import styles from '../../../../app/docs/docs.module.css';

export type DocsCategoryGridProps = {
  readonly productSlug: DocsProductSlug;
  readonly categories: readonly DocsCategory[];
};

export function DocsCategoryGrid({ productSlug, categories }: DocsCategoryGridProps): ReactElement {
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
          <span className={styles.docsCategoryAction}>Browse Articles →</span>
        </Link>
      ))}
    </div>
  );
}
