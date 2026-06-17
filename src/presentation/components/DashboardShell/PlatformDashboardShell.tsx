'use client';

import Link from 'next/link';
import type { ReactElement } from 'react';
import {
  pickAppsLauncherClassNames,
  pickDashboardLayoutClassNames,
  pickDashboardPageLoadingClassNames,
  pickSidebarBrandingClassNames,
  useZenformedAppLaunch,
  ZenformedAppList,
  ZenformedDashboardAppShell,
  ZenformedDashboardPageLoading,
  ZenformedDashboardSidebarRow,
  ZenformedSidebarBranding,
} from '@zenformed/core/dashboard-shell';
import { platformAppIconSrc } from '@/platform/assets/platformAppIcon';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import type { UsePlatformDashboardResult } from '@/presentation/features/platformDashboard/usePlatformDashboard';
import { PlatformDashboardHeader } from '@/presentation/components/DashboardShell/PlatformDashboardHeader';
import { PlatformDashboardModals } from '@/presentation/components/DashboardShell/PlatformDashboardModals';
import { PlatformSettingsDrawer } from '@/presentation/components/DashboardShell/PlatformSettingsDrawer';
import { PlatformSidebar } from '@/presentation/components/DashboardShell/PlatformSidebar';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import { usePlatformProductEntitlements } from '@/presentation/hooks/usePlatformProductEntitlements';
import { partitionPlatformAppsByOwnership } from '@/presentation/features/platformDashboard/platformDashboardProducts';
import { PlatformAvailableProductsGrid } from '@/presentation/components/DashboardShell/PlatformAvailableProductsGrid';
import { PlatformDashboardAppsBillingSection } from '@/presentation/components/DashboardShell/PlatformDashboardAppsBillingSection';
import { PlatformDashboardTeamMembersSection } from '@/presentation/components/DashboardShell/PlatformDashboardTeamMembersSection';
import {
  formatPlatformDashboardSeatsUsed,
  usePlatformOrganizationWorkspaceSummary,
} from '@/presentation/hooks/usePlatformOrganizationWorkspaceSummary';
import shellStyles from '../../../../app/(dashboard)/dashboard/dashboard.module.css';
import pageStyles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

const sidebarBrandingClassNames = pickSidebarBrandingClassNames(shellStyles);
const layoutClassNames = pickDashboardLayoutClassNames(shellStyles);
const pageLoadingClassNames = pickDashboardPageLoadingClassNames(shellStyles);

export type PlatformDashboardShellProps = {
  dash: UsePlatformDashboardResult;
};

export function PlatformDashboardShell({ dash }: PlatformDashboardShellProps): ReactElement {
  const { session } = useSaaSProfile();
  const { ownedAppIds, isLoading: entitlementsLoading, error: entitlementsError } =
    usePlatformProductEntitlements(session?.access_token);
  const { myApps, availableProducts } = partitionPlatformAppsByOwnership(ownedAppIds);
  const organizationDisplayName =
    dash.brandingLoading && !dash.shopName
      ? content.loading.page
      : dash.shopName || content.branding.defaultShopNameFallback;
  const applicationsOwnedCount = entitlementsLoading ? '—' : String(myApps.length);
  const organizationSummary = usePlatformOrganizationWorkspaceSummary(
    dash.getAccessToken,
    !dash.authLoading
  );
  const seatsUsedDisplay = formatPlatformDashboardSeatsUsed(
    organizationSummary.activeMemberCount,
    organizationSummary.seatLimit,
    organizationSummary.isLoading
  );
  const appsLauncherClassNames = pickAppsLauncherClassNames(pageStyles);
  const { launchApp, launchingAppId, launchError } = useZenformedAppLaunch({
    launchApiUrl: '/api/internal/app-launch',
    getAccessToken: () => session?.access_token ?? null,
  });
  const appsLauncherLabels = {
    triggerAriaLabel: nav.header.appsLauncher.triggerAriaLabel,
    popoverAriaLabel: nav.header.appsLauncher.popoverAriaLabel,
    appsSectionTitle: content.apps.sectionTitle,
  };

  if (dash.authLoading) {
    return (
      <ZenformedDashboardPageLoading
        classNames={pageLoadingClassNames}
        message={content.loading.page}
      />
    );
  }

  return (
    <ZenformedDashboardAppShell classNames={{ appLayout: layoutClassNames.appLayout }}>
      <ZenformedDashboardSidebarRow
        classNames={{
          dashboardWithSidebar: layoutClassNames.dashboardWithSidebar,
          sidebarRail: layoutClassNames.sidebarRail,
          mainColumn: layoutClassNames.mainColumn,
        }}
        sidebar={
          <PlatformSidebar activeId={dash.sidebarNav} onSelect={dash.setSidebarNav}>
            <ZenformedSidebarBranding
              classNames={sidebarBrandingClassNames}
              appName={content.dashboard.title}
              appIconSrc={platformAppIconSrc()}
              appAltText={content.dashboard.title}
            />
          </PlatformSidebar>
        }
        mainColumn={
          <>
            <PlatformDashboardHeader
              user={dash.user ? { email: dash.user.email } : null}
              effectiveLicenseTier={dash.effectiveLicenseTier}
              organizationRoleLabel={dash.organizationRoleLabel}
              avatarUrl={null}
              avatarLoading={false}
              getAccessToken={dash.getAccessToken}
              onOpenSettings={() => {
                requestAnimationFrame(() => dash.openSettings('account'));
              }}
              onRequestSignOutConfirm={() => dash.setSignOutModalOpen(true)}
              onRequestProfilePhotoModal={() => dash.setProfilePhotoModalOpen(true)}
            />
            <main className={shellStyles.mainContent}>
              <div className={pageStyles.dashboardContent}>
                <div className={pageStyles.dashboardLayout}>
                  <div className={pageStyles.dashboardLeftColumn}>
                    <header className={pageStyles.dashboardPanel}>
                      <h1
                        className={`${pageStyles.dashboardHeadingBar} ${pageStyles.dashboardPageTitle}`}
                      >
                        {content.dashboard.accountTitle}
                      </h1>
                      <div className={pageStyles.dashboardPanelBody}>
                        <p className={pageStyles.dashboardPageSubtitle}>
                          {content.dashboard.accountSubtitle}
                        </p>
                        <dl className={pageStyles.dashboardSummaryMetrics}>
                          <div className={pageStyles.dashboardSummaryMetric}>
                            <dt className={pageStyles.dashboardSummaryMetricLabel}>
                              {content.dashboard.organizationLabel}
                            </dt>
                            <dd
                              className={`${pageStyles.dashboardSummaryMetricValue} ${pageStyles.dashboardSummaryMetricValueText}`}
                            >
                              {organizationDisplayName}
                            </dd>
                          </div>
                          <div className={pageStyles.dashboardSummaryMetric}>
                            <dt className={pageStyles.dashboardSummaryMetricLabel}>
                              {content.dashboard.applicationsOwnedLabel}
                            </dt>
                            <dd className={pageStyles.dashboardSummaryMetricValue}>
                              {applicationsOwnedCount}
                            </dd>
                          </div>
                          <div className={pageStyles.dashboardSummaryMetric}>
                            <dt className={pageStyles.dashboardSummaryMetricLabel}>
                              {content.dashboard.seatsUsedLabel}
                            </dt>
                            <dd className={pageStyles.dashboardSummaryMetricValue}>
                              {seatsUsedDisplay}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </header>

                    <section className={pageStyles.dashboardPanel}>
                      <h2
                        className={`${pageStyles.dashboardHeadingBar} ${pageStyles.dashboardSectionTitle}`}
                      >
                        {content.apps.myAppsSectionTitle}
                      </h2>
                      <div className={pageStyles.dashboardPanelBody}>
                        {entitlementsLoading ? (
                          <p className={pageStyles.appsSectionHint}>{content.apps.loadingApps}</p>
                        ) : entitlementsError ? (
                          <p className={pageStyles.appsLaunchError} role="alert">
                            {entitlementsError}
                          </p>
                        ) : myApps.length === 0 ? (
                          <div className={pageStyles.myAppsEmpty}>
                            <p className={pageStyles.myAppsEmptyState}>
                              {content.apps.myAppsEmptyState}
                            </p>
                            <Link href="/products" className={pageStyles.myAppsBrowseButton}>
                              {content.apps.browseProductsAction}
                            </Link>
                          </div>
                        ) : (
                          <ZenformedAppList
                            apps={myApps}
                            classNames={appsLauncherClassNames}
                            labels={appsLauncherLabels}
                            variant="cards"
                            launchApp={launchApp}
                            launchingAppId={launchingAppId}
                            launchError={launchError}
                          />
                        )}
                      </div>
                    </section>

                    <PlatformDashboardTeamMembersSection
                      summary={organizationSummary}
                      onManageTeamMembers={() => dash.openSettings('teamMembers')}
                    />

                    <PlatformDashboardAppsBillingSection
                      summary={organizationSummary}
                      onManageBilling={() => dash.openSettings('appsBilling')}
                    />
                  </div>

                  <div className={pageStyles.dashboardRightColumn}>
                    <section
                      className={`${pageStyles.dashboardPanel} ${pageStyles.availableProductsPanel}`}
                    >
                      <h1 className={pageStyles.availableProductsTitle}>
                        {content.apps.availableProductsSectionTitle}
                      </h1>
                      <div className={pageStyles.dashboardPanelBody}>
                        {entitlementsLoading ? (
                          <p className={pageStyles.appsSectionHint}>{content.apps.loadingApps}</p>
                        ) : (
                          <PlatformAvailableProductsGrid products={availableProducts} />
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </main>
          </>
        }
      />

      <PlatformSettingsDrawer
        open={dash.settingsOpen}
        onClose={dash.closeSettings}
        initialCategory={dash.settingsInitialCategory}
        getAccessToken={dash.getAccessToken}
        shellContext={{
          userEmail: dash.user?.email ?? null,
          organizationName: dash.shopName ?? null,
          logoUrl: dash.logoUrl ?? null,
        }}
      />

      <PlatformDashboardModals
        signOut={{
          isOpen: dash.signOutModalOpen,
          onClose: () => dash.setSignOutModalOpen(false),
          onConfirm: async () => {
            await dash.signOut();
          },
        }}
        profilePhoto={null}
      />
    </ZenformedDashboardAppShell>
  );
}
