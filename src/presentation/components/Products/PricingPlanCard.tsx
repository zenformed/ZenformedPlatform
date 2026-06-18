'use client';

import type { ReactElement } from 'react';
import {
  formatPlanAnnualEquivalent,
  formatPlanPriceAnnual,
  formatPlanPriceMonthly,
  type BillingPeriod,
  type ProductPlanDisplay,
} from '@/platform/products/productPricingCatalog';
import type { PlanCardOwnershipAction } from '@/platform/products/productPlanOwnership';
import { PlanTierIcon } from '@/presentation/components/Products/PlanTierIcon';
import { PricingCheckIcon } from '@/presentation/components/Products/PricingCheckIcon';
import styles from '../../../../app/products/products.module.css';

export type PricingPlanCardProps = {
  readonly plan: ProductPlanDisplay;
  readonly billingPeriod: BillingPeriod;
  readonly ownershipAction: PlanCardOwnershipAction;
  readonly onSelectTrial: () => void;
  readonly onSelectPaid: () => void;
};

export function PricingPlanCard({
  plan,
  billingPeriod,
  ownershipAction,
  onSelectTrial,
  onSelectPaid,
}: PricingPlanCardProps): ReactElement {
  const isAnnual = billingPeriod === 'annual';
  const priceDisplay = isAnnual
    ? formatPlanPriceAnnual(plan.annualAmount)
    : formatPlanPriceMonthly(plan.monthlyAmount);
  const priceDetail = isAnnual
    ? `≈ ${formatPlanAnnualEquivalent(plan.annualAmount)} billed annually`
    : null;
  const showRecommendedBadge = plan.recommended === true && ownershipAction.kind !== 'current';
  const showOwnedBadge = ownershipAction.kind === 'current';
  const showTrialButton = ownershipAction.kind === 'purchase';
  const primaryDisabled =
    ownershipAction.kind === 'current' ||
    (ownershipAction.kind === 'purchase' && plan.ctaDisabled === true);

  const card = (
    <article
      className={`${styles.planCard} ${showRecommendedBadge ? styles.planCardRecommended : ''}`}
      data-monthly-amount={plan.monthlyAmount}
      data-annual-amount={plan.annualAmount}
    >
      {showRecommendedBadge ? <div className={styles.planBadge}>Recommended</div> : null}
      {showOwnedBadge ? <div className={styles.planBadgeOwned}>Owned</div> : null}
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
          {plan.primarySpec != null ? (
            <div className={styles.planSpec}>
              <dt>{plan.primarySpec.label}</dt>
              <dd>{plan.primarySpec.value}</dd>
            </div>
          ) : null}
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
          {showTrialButton ? (
            <button
              type="button"
              className={`${styles.planCta} ${styles.planCtaTry} ${styles.planCtaAccent}`}
              disabled={plan.ctaDisabled === true}
              onClick={onSelectTrial}
              aria-disabled={plan.ctaDisabled === true}
            >
              Try for free
            </button>
          ) : null}
          <button
            type="button"
            className={`${styles.planCta} ${showTrialButton ? styles.planCtaChoose : styles.planCtaChooseFull} ${styles.planCtaChooseDark}`}
            disabled={primaryDisabled}
            onClick={onSelectPaid}
            aria-disabled={primaryDisabled}
          >
            {ownershipAction.primaryLabel}
          </button>
        </div>
      </div>
    </article>
  );

  if (showRecommendedBadge) {
    return <div className={styles.planCardRgbWrap}>{card}</div>;
  }

  return card;
}
