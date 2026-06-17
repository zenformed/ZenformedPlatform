'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import type { PlatformAppEntry } from '@/platform/appDefinitions/platformApps';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import styles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformAvailableProductsGridProps = {
  readonly products: readonly PlatformAppEntry[];
};

export function PlatformAvailableProductsGrid({
  products,
}: PlatformAvailableProductsGridProps): ReactElement {
  return (
    <div className={styles.productMarketplaceGrid}>
      {products.map((product) => {
        const isLive = product.status === 'live';
        return (
          <article key={product.id} className={styles.productMarketplaceCard}>
            {isLive ? (
              <span className={styles.productMarketplaceLiveBadge}>
                {content.products.statusLiveBadge}
              </span>
            ) : (
              <span className={styles.productMarketplaceComingSoonBadge}>
                {content.products.statusComingSoon}
              </span>
            )}
            <div className={styles.productMarketplaceTitleRow}>
              <ProductIcon product={product} />
              <h3 className={styles.productMarketplaceCardTitle}>{product.name}</h3>
            </div>
            <p className={styles.productMarketplaceCardTagline}>{product.tagline}</p>
            <ul className={styles.productMarketplaceFeatureList}>
              {product.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className={styles.productMarketplaceCardFooter}>
              {isLive ? (
                <Link href="/products" className={styles.productMarketplaceActionGhost}>
                  {content.products.viewPlansAction}
                </Link>
              ) : (
                <span
                  className={`${styles.productMarketplaceActionGhost} ${styles.productMarketplaceActionGhostDisabled}`}
                  aria-disabled="true"
                >
                  {content.products.comingSoonAction}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProductIcon({ product }: { product: PlatformAppEntry }): ReactElement {
  const iconSrc = resolveZenformedAppIconSrc(product);
  if (iconSrc) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={iconSrc} alt="" className={styles.productMarketplaceCardIcon} />
    );
  }
  const initial = product.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className={styles.productMarketplaceCardIconFallback} aria-hidden>
      {initial}
    </span>
  );
}
