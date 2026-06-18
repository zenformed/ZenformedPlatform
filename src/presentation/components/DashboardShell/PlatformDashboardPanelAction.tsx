'use client';

import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import styles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformDashboardPanelActionProps = {
  readonly icon: ReactNode;
  readonly label: string;
  readonly href?: string;
  readonly onClick?: () => void;
};

export function PlatformDashboardPanelAction({
  icon,
  label,
  href,
  onClick,
}: PlatformDashboardPanelActionProps): ReactElement {
  const content = (
    <>
      <span className={styles.dashboardPanelActionIcon} aria-hidden>
        {icon}
      </span>
      <span>{label}</span>
    </>
  );

  return (
    <div className={styles.dashboardPanelActionRow}>
      {href ? (
        <Link href={href} className={styles.dashboardPanelActionButton}>
          {content}
        </Link>
      ) : (
        <button type="button" className={styles.dashboardPanelActionButton} onClick={onClick}>
          {content}
        </button>
      )}
    </div>
  );
}
