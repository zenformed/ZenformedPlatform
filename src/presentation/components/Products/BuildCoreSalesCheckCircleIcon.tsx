import type { ReactElement, SVGProps } from 'react';
import styles from '../../../../app/products/products.module.css';

type IconProps = SVGProps<SVGSVGElement>;

export function BuildCoreSalesCheckCircleIcon(props: IconProps): ReactElement {
  return (
    <svg
      className={styles.salesWhyFeatureIcon}
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
