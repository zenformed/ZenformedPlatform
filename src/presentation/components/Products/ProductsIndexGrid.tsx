'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { getProductPricingIndexEntries } from '@/platform/products/productPricingCatalog';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import styles from '../../../../app/products/products.module.css';

function ProductIndexIcon({ appId }: { appId: PlatformAppId }): ReactElement {
  const product = PLATFORM_APPS.find((app) => app.id === appId);
  const iconSrc = product != null ? resolveZenformedAppIconSrc(product) : undefined;

  if (iconSrc) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={iconSrc} alt="" className={styles.indexCardIcon} width={32} height={32} />
    );
  }

  const initial = product?.name.trim().charAt(0).toUpperCase() ?? '?';
  return (
    <span className={styles.indexCardIconFallback} aria-hidden>
      {initial}
    </span>
  );
}

export function ProductsIndexGrid(): ReactElement {
  const products = getProductPricingIndexEntries();

  return (
    <div className={styles.indexGrid}>
      {products.map((product) => {
        const isLive = product.status === 'live';
        return (
          <article key={product.id} className={styles.indexCard}>
            {isLive ? (
              <span className={styles.indexCardBadgeLive}>{content.products.statusLiveBadge}</span>
            ) : (
              <span className={styles.indexCardBadgeSoon}>{content.products.statusComingSoon}</span>
            )}
            <div className={styles.indexCardTitleRow}>
              <ProductIndexIcon appId={product.id} />
              <h2 className={styles.indexCardTitle}>{product.name}</h2>
            </div>
            <p className={styles.indexCardTagline}>{product.tagline}</p>
            <p className={styles.indexCardDescription}>{product.description}</p>
            <ul className={styles.indexFeatureList}>
              {product.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className={styles.indexCardFooter}>
              <Link href={product.pricingHref} className={styles.indexCardAction}>
                {isLive ? content.products.viewPlansAction : 'Preview plans'}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
