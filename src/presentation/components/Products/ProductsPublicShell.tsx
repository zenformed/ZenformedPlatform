'use client';

import type { ReactElement, ReactNode } from 'react';
import { ProductsPublicHeader } from '@/presentation/components/Products/ProductsPublicHeader';
import styles from '../../../../app/products/products.module.css';

export type ProductsPublicShellProps = {
  readonly children: ReactNode;
  readonly backHref?: string;
  readonly backLabel?: string;
  readonly salesLayout?: boolean;
  readonly mainClassName?: string;
  readonly headerInnerClassName?: string;
};

export function ProductsPublicShell({
  children,
  backHref,
  backLabel,
  salesLayout = false,
  mainClassName,
  headerInnerClassName,
}: ProductsPublicShellProps): ReactElement {
  const mainClassNames = [
    styles.main,
    salesLayout ? styles.mainSales : '',
    mainClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${styles.shell}${salesLayout ? ` ${styles.shellSales}` : ''}`}>
      <ProductsPublicHeader
        backHref={backHref}
        backLabel={backLabel}
        headerInnerClassName={headerInnerClassName}
      />
      <main className={mainClassNames}>{children}</main>
    </div>
  );
}
