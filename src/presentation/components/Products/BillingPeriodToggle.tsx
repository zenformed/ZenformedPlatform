'use client';

import type { ReactElement } from 'react';
import type { BillingPeriod } from '@/platform/products/productPricingCatalog';
import styles from '../../../../app/products/products.module.css';

export type BillingPeriodToggleProps = {
  readonly period: BillingPeriod;
  readonly annualLabel: string;
  readonly onChange: (period: BillingPeriod) => void;
};

export function BillingPeriodToggle({
  period,
  annualLabel,
  onChange,
}: BillingPeriodToggleProps): ReactElement {
  return (
    <div className={styles.billingToggle} role="group" aria-label="Billing period">
      <button
        type="button"
        className={`${styles.billingToggleOption} ${period === 'monthly' ? styles.billingToggleOptionActive : ''}`}
        aria-pressed={period === 'monthly'}
        onClick={() => onChange('monthly')}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`${styles.billingToggleOption} ${period === 'annual' ? styles.billingToggleOptionActive : ''}`}
        aria-pressed={period === 'annual'}
        onClick={() => onChange('annual')}
      >
        Annual
        <span className={styles.billingToggleLabel}>{annualLabel}</span>
      </button>
    </div>
  );
}
