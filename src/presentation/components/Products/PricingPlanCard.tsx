'use client';

import type { ReactElement } from 'react';
import {
  formatPlanAnnualEquivalent,
  formatPlanPriceAnnual,
  formatPlanPriceMonthly,
  type BillingPeriod,
  type ProductPlanDisplay,
} from '@/platform/products/productPricingCatalog';
import { PlanTierIcon } from '@/presentation/components/Products/PlanTierIcon';
import { PricingCheckIcon } from '@/presentation/components/Products/PricingCheckIcon';
import styles from '../../../../app/products/products.module.css';

export type PricingPlanCardProps = {
  readonly plan: ProductPlanDisplay;
  readonly billingPeriod: BillingPeriod;
};

export function PricingPlanCard({ plan, billingPeriod }: PricingPlanCardProps): ReactElement {
  const isAnnual = billingPeriod === 'annual';
  const priceDisplay = isAnnual
    ? formatPlanPriceAnnual(plan.annualAmount)
    : formatPlanPriceMonthly(plan.monthlyAmount);
  const priceDetail = isAnnual
    ? `≈ ${formatPlanAnnualEquivalent(plan.annualAmount)} billed annually`
    : null;

  const card = (
    <article
      className={`${styles.planCard} ${plan.recommended ? styles.planCardRecommended : ''}`}
      data-monthly-amount={plan.monthlyAmount}
      data-annual-amount={plan.annualAmount}
    >
      {plan.recommended ? <div className={styles.planBadge}>Recommended</div> : null}
      <div className={styles.planCardContent}>
        <div className={styles.planTitleRow}>
          <h3 className={styles.planTitle}>{plan.displayName}</h3>
          <PlanTierIcon planSlug={plan.planSlug} recommended={plan.recommended} />
        </div>
        <div className={styles.planPriceWrap}>
          <p className={styles.planPrice}>{priceDisplay}</p>
          {priceDetail ? <p className={styles.planPriceDetail}>{priceDetail}</p> : null}
        </div>
        <dl className={styles.planSpecs}>
          <div className={styles.planSpec}>
            <dt>Seats</dt>
            <dd>{plan.seats}</dd>
          </div>
        </dl>
        {plan.tagline != null && plan.tagline.trim() !== '' ? (
          <p className={styles.planTagline}>{plan.tagline}</p>
        ) : null}
        <ul className={styles.planFeatures}>
          {plan.features.map((feature) => (
            <li key={feature}>
              <PricingCheckIcon className={styles.planFeatureCheck} />
              <span>{feature}</span>
            </li>
          ))}
          <li>
            <PricingCheckIcon className={styles.planFeatureCheck} />
            <span>{plan.supportLevel}</span>
          </li>
        </ul>
        <div className={styles.planCtaRow}>
          <button
            type="button"
            className={`${styles.planCta} ${styles.planCtaTry} ${styles.planCtaAccent}`}
            disabled={plan.ctaDisabled === true}
            data-action="trial"
            data-app-slug={plan.cartItemKey.split('-')[0]}
            data-plan-slug={plan.planSlug}
            aria-disabled={plan.ctaDisabled === true}
          >
            Try for free
          </button>
          <button
            type="button"
            className={`${styles.planCta} ${styles.planCtaChoose} ${styles.planCtaChooseDark}`}
            disabled={plan.ctaDisabled === true}
            data-cart-item={plan.cartItemKey}
            data-app-slug={plan.cartItemKey.split('-')[0]}
            data-plan-slug={plan.planSlug}
            aria-disabled={plan.ctaDisabled === true}
          >
            {plan.ctaLabel}
          </button>
        </div>
      </div>
    </article>
  );

  if (plan.recommended) {
    return <div className={styles.planCardRgbWrap}>{card}</div>;
  }

  return card;
}
