import type { ReactElement } from 'react';
import type { NormalizedPlanSlug } from '@zenformed/core';
import styles from '../../../../app/products/products.module.css';

export type PlanTierIconProps = {
  readonly planSlug: NormalizedPlanSlug;
  readonly recommended?: boolean;
};

function iconClass(planSlug: NormalizedPlanSlug, recommended?: boolean): string {
  if (planSlug === 'growth' || recommended === true) return styles.planTierIconGrowth;
  if (planSlug === 'pro') return styles.planTierIconPro;
  if (planSlug === 'standard') return styles.planTierIconStandard;
  return styles.planTierIconStarter;
}

export function PlanTierIcon({ planSlug, recommended }: PlanTierIconProps): ReactElement {
  const className = `${styles.planTierIcon} ${iconClass(planSlug, recommended)}`;

  if (planSlug === 'pro') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
          <path
            d="M12 3.5 14.2 9h5.8l-4.7 3.4 1.8 5.6L12 17.8 7.7 18l1.8-5.6L4.8 9h5.8L12 3.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
    );
  }

  if (planSlug === 'growth' || recommended === true) {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
          <path
            d="M4 16l4.5-4.5 3.5 3.5L20 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 7h5v5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (planSlug === 'standard') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
          <path
            d="M7 4h10v16H7V4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
        <path
          d="M12 3c2.2 2.8 4.5 4.2 7 4.5-1.2 5.4-4.3 8.5-7 9.5-2.7-1-5.8-4.1-7-9.5 2.5-.3 4.8-1.7 7-4.5Z"
          fill="currentColor"
        />
        <path
          d="M12 10v5M10 12h4"
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
