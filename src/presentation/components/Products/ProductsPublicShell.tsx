'use client';

import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { platformAppIconSrc } from '@/platform/assets/platformAppIcon';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { ProductsPublicAccountNav } from '@/presentation/components/Products/ProductsPublicAccountNav';
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
  const iconSrc = platformAppIconSrc();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/products" className={styles.brandLink}>
            {iconSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={iconSrc} alt="" className={styles.brandIcon} width={32} height={32} />
            ) : null}
            <span className={styles.brandName}>{platformAppDefinition.displayName}</span>
          </Link>
          <nav className={styles.headerNav} aria-label="Products">
            {backHref != null && backLabel != null && backLabel.trim() !== '' ? (
              <Link href={backHref} className={styles.headerLink}>
                {backLabel}
              </Link>
            ) : null}
            <ProductsPublicAccountNav />
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
