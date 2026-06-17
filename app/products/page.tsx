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
        <p className={styles.indexIntro}>
          Compare plans for BuildCore, ForgeCore, and FormCore. Pricing pages are store-ready —
          checkout and billing activation will connect here later.
        </p>
      </div>
      <ProductsIndexGrid />
    </ProductsPublicShell>
  );
}
