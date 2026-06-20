import type { ReactElement } from 'react';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { ProductsIndexGrid } from '@/presentation/components/Products/ProductsIndexGrid';
import { ProductsPublicShell } from '@/presentation/components/Products/ProductsPublicShell';
import styles from './products.module.css';

export default function ProductsPage(): ReactElement {
  return (
    <ProductsPublicShell>
      <div className={styles.indexHeader}>
        <h1 className={styles.indexTitle}>{content.products.pageTitle}</h1>
        <p className={styles.indexIntro}>Explore the Zenformed product suite.</p>
      </div>
      <ProductsIndexGrid />
      <p className={styles.indexDevelopmentNotice} role="status">
        <span className={styles.indexDevelopmentNoticeMark} aria-hidden>
          !
        </span>
        {content.products.developmentNotice}
      </p>
    </ProductsPublicShell>
  );
}
