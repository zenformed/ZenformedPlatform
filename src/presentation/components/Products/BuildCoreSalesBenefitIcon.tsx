import type { ReactElement, SVGProps } from 'react';
import type { BuildCoreBenefitIconId } from '@/platform/products/buildCoreSalesContent';
import styles from '../../../../app/products/products.module.css';

type IconProps = SVGProps<SVGSVGElement>;

function ProjectsIcon(props: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3 2 8.5l10 5.5L22 8.5 12 3Z" />
      <path d="m2 13.5 10 5.5 10-5.5" />
      <path d="m2 18.5 10 5.5 10-5.5" />
    </svg>
  );
}

function PortalIcon(props: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BudgetsIcon(props: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function ReportingIcon(props: IconProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 16v-5" />
      <path d="M12 16V8" />
      <path d="M17 16v-9" />
    </svg>
  );
}

const ICON_BY_ID: Record<BuildCoreBenefitIconId, (props: IconProps) => ReactElement> = {
  projects: ProjectsIcon,
  portal: PortalIcon,
  budgets: BudgetsIcon,
  reporting: ReportingIcon,
};

const TONE_CLASS: Record<BuildCoreBenefitIconId, string> = {
  projects: styles.salesBenefitIconProjects,
  portal: styles.salesBenefitIconPortal,
  budgets: styles.salesBenefitIconBudgets,
  reporting: styles.salesBenefitIconReporting,
};

export type BuildCoreSalesBenefitIconProps = {
  readonly icon: BuildCoreBenefitIconId;
};

export function BuildCoreSalesBenefitIcon({ icon }: BuildCoreSalesBenefitIconProps): ReactElement {
  const Icon = ICON_BY_ID[icon];
  return (
    <span className={`${styles.salesBenefitIconWrap} ${TONE_CLASS[icon]}`}>
      <Icon />
    </span>
  );
}
