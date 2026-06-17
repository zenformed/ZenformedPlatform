import type { ReactElement } from 'react';
import styles from '../../../../app/products/products.module.css';

export type PricingCheckIconProps = {
  readonly className?: string;
};

export function PricingCheckIcon({ className }: PricingCheckIconProps): ReactElement {
  return (
    <svg
      className={className ?? styles.pricingCheckIcon}
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.18" />
      <path
        d="M4.75 8.25 6.9 10.4l4.35-4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
