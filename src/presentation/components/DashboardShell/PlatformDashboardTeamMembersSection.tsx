'use client';

import type { ReactElement } from 'react';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import {
  formatPlatformDashboardSummaryMetric,
  type PlatformOrganizationWorkspaceSummary,
} from '@/presentation/hooks/usePlatformOrganizationWorkspaceSummary';
import styles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformDashboardTeamMembersSectionProps = {
  readonly summary: PlatformOrganizationWorkspaceSummary;
  readonly onManageTeamMembers: () => void;
};

export function PlatformDashboardTeamMembersSection({
  summary,
  onManageTeamMembers,
}: PlatformDashboardTeamMembersSectionProps): ReactElement {
  const { isLoading } = summary;

  return (
    <section className={styles.dashboardPanel}>
      <h2 className={`${styles.dashboardHeadingBar} ${styles.dashboardSectionTitle}`}>
        {content.teamMembers.sectionTitle}
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
                  {content.teamMembers.activeMembersLabel}
                </dt>
                <dd className={styles.dashboardSummaryMetricValue}>
                  {formatPlatformDashboardSummaryMetric(summary.activeMemberCount, isLoading)}
                </dd>
              </div>
              <div className={styles.dashboardSummaryMetric}>
                <dt className={styles.dashboardSummaryMetricLabel}>
                  {content.teamMembers.pendingInvitesLabel}
                </dt>
                <dd className={styles.dashboardSummaryMetricValue}>
                  {formatPlatformDashboardSummaryMetric(summary.pendingInviteCount, isLoading)}
                </dd>
              </div>
              <div className={styles.dashboardSummaryMetric}>
                <dt className={styles.dashboardSummaryMetricLabel}>
                  {content.teamMembers.seatsAvailableLabel}
                </dt>
                <dd className={styles.dashboardSummaryMetricValue}>
                  {formatPlatformDashboardSummaryMetric(summary.seatsAvailable, isLoading)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              className={styles.myAppsBrowseButton}
              onClick={onManageTeamMembers}
            >
              {content.teamMembers.manageAction}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
