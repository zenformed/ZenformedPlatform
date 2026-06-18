'use client';

import type { ReactElement } from 'react';
import { BillIcon } from '@/platform/icons/platformDashboardShellIcons';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { PlatformDashboardPanelAction } from '@/presentation/components/DashboardShell/PlatformDashboardPanelAction';
import {
  formatPlatformDashboardActiveSubscriptions,
  formatPlatformDashboardMonthlySpend,
  type PlatformOrganizationWorkspaceSummary,
} from '@/presentation/hooks/usePlatformOrganizationWorkspaceSummary';
import styles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformDashboardAppsBillingSectionProps = {
  readonly summary: PlatformOrganizationWorkspaceSummary;
  readonly activeSubscriptionsCount: number;
  readonly activeSubscriptionsLoading: boolean;
  readonly onManageBilling: () => void;
};

export function PlatformDashboardAppsBillingSection({
  summary,
  activeSubscriptionsCount,
  activeSubscriptionsLoading,
  onManageBilling,
}: PlatformDashboardAppsBillingSectionProps): ReactElement {
  const billingMetricsLoading = summary.isLoading || activeSubscriptionsLoading;

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
        ) : (
          <>
            <dl className={styles.dashboardSummaryMetrics}>
              <div className={styles.dashboardSummaryMetric}>
                <dt className={styles.dashboardSummaryMetricLabel}>
                  {content.appsBilling.activeSubscriptionsLabel}
                </dt>
                <dd className={styles.dashboardSummaryMetricValue}>
                  {formatPlatformDashboardActiveSubscriptions(
                    activeSubscriptionsCount,
                    billingMetricsLoading
                  )}
                </dd>
              </div>
              <div className={styles.dashboardSummaryMetric}>
                <dt className={styles.dashboardSummaryMetricLabel}>
                  {content.appsBilling.monthlySpendLabel}
                </dt>
                <dd className={styles.dashboardSummaryMetricValue}>
                  {formatPlatformDashboardMonthlySpend(
                    summary.monthlySpendCents,
                    billingMetricsLoading
                  )}
                </dd>
              </div>
            </dl>
            <PlatformDashboardPanelAction
              icon={<BillIcon />}
              label={content.appsBilling.manageAction}
              onClick={onManageBilling}
            />
          </>
        )}
      </div>
    </section>
  );
}
