'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import { resolveZenformedAppIconSrc } from '@zenformed/core/dashboard-shell';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import type { PlatformAppId } from '@/platform/appDefinitions/platformApps';
import { getProductPricingIndexEntries } from '@/platform/products/productPricingCatalog';
import {
  resolveProductListingCtaLabel,
  STANDARD_TIERED_PLAN_SLUGS,
} from '@/platform/products/productPlanOwnership';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { PricingCheckIcon } from '@/presentation/components/Products/PricingCheckIcon';
import { usePlatformProductEntitlements } from '@/presentation/hooks/usePlatformProductEntitlements';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import styles from '../../../../app/products/products.module.css';

const INDEX_CARD_CLASS: Record<PlatformAppId, string> = {
  buildcore: styles.indexCardBuildcore,
  forgecore: styles.indexCardForgecore,
  formcore: styles.indexCardFormcore,
  analyticscore: styles.indexCardAnalyticscore,
};

function ProductIndexIcon({ appId }: { appId: PlatformAppId }): ReactElement {
  const product = PLATFORM_APPS.find((app) => app.id === appId);
  const iconSrc =
    product?.iconSrc?.trim() ||
    (product != null ? resolveZenformedAppIconSrc(product) : undefined);

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
  const { session } = useSaaSProfile();
  const { entitlementsByApp } = usePlatformProductEntitlements(session?.access_token);

  return (
    <div className={styles.indexGrid}>
      {products.map((product) => {
        const isLive = product.status === 'live';
        const entitlement = entitlementsByApp[product.id];
        const owned = entitlement?.owned === true;
        const ctaLabel = resolveProductListingCtaLabel({
          isLive,
          owned,
          currentPlanSlug: entitlement?.planSlug ?? null,
          catalogPlanSlugs: STANDARD_TIERED_PLAN_SLUGS,
          viewPlansLabel: content.products.viewPlansAction,
          previewPlansLabel: 'Preview plans',
        });

        return (
          <article key={product.id} className={`${styles.indexCard} ${INDEX_CARD_CLASS[product.id]}`}>
            {owned ? (
              <span className={styles.indexCardBadgeOwned}>Owned</span>
            ) : isLive ? (
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
                <li key={feature}>
                  <PricingCheckIcon className={styles.indexFeatureCheck} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className={styles.indexCardFooter}>
              <Link href={product.pricingHref} className={styles.indexCardAction}>
                {ctaLabel}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
