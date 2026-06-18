'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { platformAppIconSrc } from '@/platform/assets/platformAppIcon';
import { platformAppDefinition } from '@/platform/appDefinitions/platform';
import { ProductsPublicAccountNav } from '@/presentation/components/Products/ProductsPublicAccountNav';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import styles from '../../../../app/products/products.module.css';

export type ProductsPublicHeaderProps = {
  readonly backHref?: string;
  readonly backLabel?: string;
};

export function ProductsPublicHeader({
  backHref,
  backLabel,
}: ProductsPublicHeaderProps): ReactElement {
  const iconSrc = platformAppIconSrc();
  const { session, loading } = useSaaSProfile();
  const hasBackLink =
    backHref != null && backLabel != null && backLabel.trim() !== '';
  const isLoggedIn = !loading && session != null;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/products" className={styles.brandLink}>
          {iconSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={iconSrc} alt="" className={styles.brandIcon} width={32} height={32} />
          ) : null}
          <span className={styles.brandName}>{platformAppDefinition.displayName}</span>
        </Link>
        <nav
          className={styles.headerNav}
          aria-label="Products"
          data-logged-in={isLoggedIn ? 'true' : 'false'}
        >
          {hasBackLink ? (
            <Link
              href={backHref}
              className={`${styles.headerLink} ${styles.headerBackLink}`}
            >
              {backLabel}
            </Link>
          ) : null}
          <ProductsPublicAccountNav
            mobileBackHref={hasBackLink ? backHref : undefined}
            mobileBackLabel={hasBackLink ? backLabel : undefined}
          />
        </nav>
      </div>
    </header>
  );
}
