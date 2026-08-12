'use client';

import type { ReactElement } from 'react';
import { resolveZenformedAppIconSrc, type ZenformedAppRegistryEntry } from '@zenformed/core/dashboard-shell';
import styles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

export type PlatformDashboardOwnedAppsGridProps = {
  readonly apps: readonly ZenformedAppRegistryEntry[];
  readonly activeUsers: number | null;
  readonly planSeats: number | null;
  readonly metricsLoading: boolean;
  readonly launchApp: (targetApp: string, returnPath?: string) => Promise<void>;
  readonly launchingAppId: string | null;
  readonly launchError?: string | null;
};

const OWNED_APP_ACCENT_CLASS: Record<string, string> = {
  buildcore: styles.ownedAppCardBuildcore,
  forgecore: styles.ownedAppCardForgecore,
  formcore: styles.ownedAppCardFormcore,
  analyticscore: styles.ownedAppCardAnalyticscore,
};

function formatCount(value: number | null, loading: boolean): string {
  return loading || value == null ? '—' : String(value);
}

export function PlatformDashboardOwnedAppsGrid({
  apps,
  activeUsers,
  planSeats,
  metricsLoading,
  launchApp,
  launchingAppId,
  launchError,
}: PlatformDashboardOwnedAppsGridProps): ReactElement {
  return (
    <div>
      {launchError ? <p className={styles.appsLaunchError}>{launchError}</p> : null}
      <div className={styles.ownedAppCardGrid}>
        {apps.map((app) => {
          const isLaunching = launchingAppId === app.id;
          const iconSrc = resolveZenformedAppIconSrc(app);
          return (
            <article
              key={app.id}
              className={`${styles.ownedAppCard} ${OWNED_APP_ACCENT_CLASS[app.id] ?? ''}`}
            >
              <div className={styles.ownedAppCardHeader}>
                {iconSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconSrc} alt="" className={styles.ownedAppCardIcon} />
                ) : null}
                <div className={styles.ownedAppCardIdentity}>
                  <div className={styles.ownedAppCardTitleRow}>
                    <h3 className={styles.ownedAppCardTitle}>{app.name}</h3>
                    <div className={styles.ownedAppCardBadges}>
                      {app.entitlementBadges?.planLabel ? <span>{app.entitlementBadges.planLabel}</span> : null}
                      {app.entitlementBadges?.statusLabel ? <span>{app.entitlementBadges.statusLabel}</span> : null}
                    </div>
                  </div>
                  <p className={styles.ownedAppCardDescription}>{app.description}</p>
                </div>
              </div>
              <div className={styles.ownedAppCardFooter}>
                <div className={styles.ownedAppCardMeta}>
                  <dl className={styles.ownedAppCardMetrics}>
                    <div>
                      <dt>Users</dt>
                      <dd>{formatCount(activeUsers, metricsLoading)}</dd>
                    </div>
                    <div>
                      <dt>Seats</dt>
                      <dd>{formatCount(planSeats, metricsLoading)}</dd>
                    </div>
                  </dl>
                </div>
                <button
                  type="button"
                  className={styles.ownedAppOpenButton}
                  disabled={isLaunching || app.launchTarget == null}
                  onClick={() => void launchApp(app.launchTarget!, '/dashboard')}
                >
                  {isLaunching ? 'Opening…' : app.status === 'coming_soon' ? 'Coming soon' : 'Open app'}
                  {app.status === 'live' ? <span aria-hidden>↗</span> : null}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
