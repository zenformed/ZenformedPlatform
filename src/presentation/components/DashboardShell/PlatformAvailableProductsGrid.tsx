'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import type { PlatformAppEntry, PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { PricingCheckIcon } from '@/presentation/components/Products/PricingCheckIcon';
import styles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformAvailableProductsGridProps = {
  readonly products: readonly PlatformAppEntry[];
};

const PRODUCT_CARD_CLASS: Record<PlatformAppId, string> = {
  buildcore: styles.productMarketplaceCardBuildcore,
  forgecore: styles.productMarketplaceCardForgecore,
  formcore: styles.productMarketplaceCardFormcore,
  analyticscore: styles.productMarketplaceCardAnalyticscore,
};

const MAX_VISIBLE_PRODUCTS = 3;

export function PlatformAvailableProductsGrid({
  products,
}: PlatformAvailableProductsGridProps): ReactElement {
  const visibleProducts = products.slice(0, MAX_VISIBLE_PRODUCTS);
  const hasMoreProducts = products.length > MAX_VISIBLE_PRODUCTS;

  return (
    <div className={styles.productMarketplaceSection}>
      <div className={styles.productMarketplaceGrid}>
        {visibleProducts.map((product) => {
          const isLive = product.status === 'live';
          return (
            <article
              key={product.id}
              className={`${styles.productMarketplaceCard} ${PRODUCT_CARD_CLASS[product.id]}`}
            >
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
                  <li key={feature}>
                    <PricingCheckIcon className={styles.productMarketplaceFeatureCheck} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.productMarketplaceCardFooter}>
                {isLive ? (
                  <Link href={`/products/${product.id}`} className={styles.productMarketplaceActionGhost}>
                    {content.products.viewPlansAction}
                  </Link>
                ) : (
                  <Link href={`/products/${product.id}`} className={styles.productMarketplaceActionGhost}>
                    Preview plans
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {hasMoreProducts ? (
        <div className={styles.productMarketplaceSeeAllRow}>
          <Link href="/products" className={styles.productMarketplaceSeeAllLink}>
            {content.apps.seeAllProductsAction}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function ProductIcon({ product }: { product: PlatformAppEntry }): ReactElement {
  const iconSrc = product.iconSrc?.trim() || resolveZenformedAppIconSrc(product);
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
