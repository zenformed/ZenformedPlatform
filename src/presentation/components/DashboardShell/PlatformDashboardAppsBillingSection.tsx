'use client';

import type { ReactElement } from 'react';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import type { PlatformOrganizationWorkspaceSummary } from '@/presentation/hooks/usePlatformOrganizationWorkspaceSummary';
import styles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformDashboardAppsBillingSectionProps = {
  readonly summary: PlatformOrganizationWorkspaceSummary;
  readonly onManageBilling: () => void;
};

export function PlatformDashboardAppsBillingSection({
  summary,
  onManageBilling,
}: PlatformDashboardAppsBillingSectionProps): ReactElement {
  const showPlaceholder = !summary.isLoading && !summary.hasBillingSummary;

  return (
    <section className={styles.dashboardPanel}>
      <h2 className={`${styles.dashboardHeadingBar} ${styles.dashboardSectionTitle}`}>
        {content.appsBilling.sectionTitle}
      </h2>
      <div className={styles.dashboardPanelBody}>
        {summary.loadError ? (
          <p className={styles.appsLaunchError} role="alert">
            {summary.loadError}
          </p>
        ) : summary.isLoading ? (
          <>
            <p className={styles.appsSectionHint}>{content.loading.page}</p>
            <button
              type="button"
              className={styles.myAppsBrowseButton}
              onClick={onManageBilling}
            >
              {content.appsBilling.manageAction}
            </button>
          </>
        ) : showPlaceholder ? (
          <>
            <p className={styles.appsSectionHint}>{content.appsBilling.placeholder}</p>
            <button
              type="button"
              className={styles.myAppsBrowseButton}
              onClick={onManageBilling}
            >
              {content.appsBilling.manageAction}
            </button>
          </>
        ) : (
          <>
            <dl className={styles.dashboardSummaryDetails}>
              <div className={styles.dashboardSummaryDetailRow}>
                <dt className={styles.dashboardSummaryDetailLabel}>
                  {content.appsBilling.currentPlanLabel}
                </dt>
                <dd className={styles.dashboardSummaryDetailValue}>{summary.planName}</dd>
              </div>
              <div className={styles.dashboardSummaryDetailRow}>
                <dt className={styles.dashboardSummaryDetailLabel}>
                  {content.appsBilling.subscriptionStatusLabel}
                </dt>
                <dd className={styles.dashboardSummaryDetailValue}>{summary.subscriptionStatus}</dd>
              </div>
              <div className={styles.dashboardSummaryDetailRow}>
                <dt className={styles.dashboardSummaryDetailLabel}>
                  {content.appsBilling.renewalDateLabel}
                </dt>
                <dd className={styles.dashboardSummaryDetailValue}>
                  {summary.renewalDateLabel ?? content.appsBilling.renewalDateUnavailable}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              className={styles.myAppsBrowseButton}
              onClick={onManageBilling}
            >
              {content.appsBilling.manageAction}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
