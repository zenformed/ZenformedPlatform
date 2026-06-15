'use client';

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
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import type { UsePlatformDashboardResult } from '@/presentation/features/platformDashboard/usePlatformDashboard';
import { PlatformDashboardHeader } from '@/presentation/components/DashboardShell/PlatformDashboardHeader';
import { PlatformDashboardModals } from '@/presentation/components/DashboardShell/PlatformDashboardModals';
import { PlatformSettingsDrawer } from '@/presentation/components/DashboardShell/PlatformSettingsDrawer';
import { PlatformSidebar } from '@/presentation/components/DashboardShell/PlatformSidebar';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
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
              avatarUrl={dash.avatarUrl}
              avatarLoading={dash.avatarLoading}
              getAccessToken={dash.getAccessToken}
              onOpenSettings={() => {
                requestAnimationFrame(() => dash.setSettingsOpen(true));
              }}
              onRequestSignOutConfirm={() => dash.setSignOutModalOpen(true)}
              onRequestProfilePhotoModal={() => dash.setProfilePhotoModalOpen(true)}
            />
            <main className={shellStyles.mainContent}>
              <div className={pageStyles.dashboardBrand}>
                {platformAppIconSrc() ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={platformAppIconSrc()}
                    alt=""
                    className={pageStyles.dashboardBrandIcon}
                  />
                ) : null}
                <h1 className={pageStyles.dashboardBrandTitle}>{content.dashboard.title}</h1>
              </div>
              <h2 className={pageStyles.appsSectionTitle}>{content.apps.sectionTitle}</h2>
              <ZenformedAppList
                apps={PLATFORM_APPS}
                classNames={appsLauncherClassNames}
                labels={appsLauncherLabels}
                variant="cards"
                launchApp={launchApp}
                launchingAppId={launchingAppId}
                launchError={launchError}
              />
            </main>
          </>
        }
      />

      <PlatformSettingsDrawer
        open={dash.settingsOpen}
        onClose={() => dash.setSettingsOpen(false)}
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
        profilePhoto={
          dash.user
            ? {
                isOpen: dash.profilePhotoModalOpen,
                onClose: () => dash.setProfilePhotoModalOpen(false),
                userEmail: dash.user.email,
                avatarUrl: dash.avatarUrl,
                hasPhoto: dash.hasAvatarPhoto,
                onSuccess: () => {
                  void dash.refetchAvatar();
                },
                getAccessToken: dash.getAccessToken,
              }
            : null
        }
      />
    </ZenformedDashboardAppShell>
  );
}
