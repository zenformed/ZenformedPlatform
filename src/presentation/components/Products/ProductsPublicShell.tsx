'use client';

import type { ReactElement, ReactNode } from 'react';
import { ProductsPublicHeader } from '@/presentation/components/Products/ProductsPublicHeader';
import styles from '../../../../app/products/products.module.css';

export type ProductsPublicShellProps = {
  readonly children: ReactNode;
  readonly backHref?: string;
  readonly backLabel?: string;
};

export function ProductsPublicShell({
  children,
  backHref,
  backLabel,
}: ProductsPublicShellProps): ReactElement {
  return (
    <div className={styles.shell}>
      <ProductsPublicHeader backHref={backHref} backLabel={backLabel} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
