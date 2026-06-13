'use client';

import type { ReactElement } from 'react';
import {
  pickDashboardLayoutClassNames,
  pickDashboardPageLoadingClassNames,
  pickSidebarBrandingClassNames,
  ZenformedDashboardAppShell,
  ZenformedDashboardPageLoading,
  ZenformedDashboardSidebarRow,
  ZenformedSidebarBranding,
} from '@zenformed/core/dashboard-shell';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import type { UsePlatformDashboardResult } from '@/presentation/features/platformDashboard/usePlatformDashboard';
import { PlatformDashboardHeader } from '@/presentation/components/DashboardShell/PlatformDashboardHeader';
import { PlatformDashboardModals } from '@/presentation/components/DashboardShell/PlatformDashboardModals';
import { PlatformSettingsDrawer } from '@/presentation/components/DashboardShell/PlatformSettingsDrawer';
import { PlatformSidebar } from '@/presentation/components/DashboardShell/PlatformSidebar';
import shellStyles from '../../../../app/(dashboard)/dashboard/dashboard.module.css';
import pageStyles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

const sidebarBrandingClassNames = pickSidebarBrandingClassNames(shellStyles);
const layoutClassNames = pickDashboardLayoutClassNames(shellStyles);
const pageLoadingClassNames = pickDashboardPageLoadingClassNames(shellStyles);

export type PlatformDashboardShellProps = {
  dash: UsePlatformDashboardResult;
};

export function PlatformDashboardShell({ dash }: PlatformDashboardShellProps): ReactElement {
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
          mainColumn: layoutClassNames.mainColumn,
        }}
        sidebar={
          <PlatformSidebar activeId={dash.sidebarNav} onSelect={dash.setSidebarNav}>
            <ZenformedSidebarBranding
              classNames={sidebarBrandingClassNames}
              shopName={dash.shopName}
              defaultShopNameFallback={content.branding.defaultShopNameFallback}
              logoUrl={dash.logoUrl}
              brandingLoading={dash.brandingLoading}
              logoUploading={dash.logoUploading}
              showCameraButton={false}
              fileInputRef={dash.headerLogoFileInputRef}
              onLogoFileChange={(e) => {
                void dash.handleLogoFileChange(e);
              }}
              companyLogoChangeTitle={nav.header.account.companyLogoChange.title}
              companyLogoChangeAriaLabel={nav.header.account.companyLogoChange.ariaLabel}
            />
          </PlatformSidebar>
        }
        mainColumn={
          <>
            <PlatformDashboardHeader
              user={dash.user ? { email: dash.user.email } : null}
              effectiveLicenseTier={dash.effectiveLicenseTier}
              organizationRoleLabel={dash.organizationRoleLabel}
              isAdmin={dash.isAdmin}
              avatarUrl={dash.avatarUrl}
              avatarLoading={dash.avatarLoading}
              shopName={dash.shopName}
              onOpenSettings={() => {
                requestAnimationFrame(() => dash.setSettingsOpen(true));
              }}
              onRequestSignOutConfirm={() => dash.setSignOutModalOpen(true)}
              onRequestProfilePhotoModal={() => dash.setProfilePhotoModalOpen(true)}
            />
            <main className={shellStyles.mainContent}>
              <h1 className={shellStyles.headerTitle}>{content.dashboard.title}</h1>
              <div className={pageStyles.placeholderGrid}>
                <div className={pageStyles.placeholderCard}>
                  <h3>{content.dashboard.placeholderCardTitle}</h3>
                  <p>{content.dashboard.placeholderCardBody}</p>
                </div>
                <div className={pageStyles.placeholderCard}>
                  <h3>Apps</h3>
                  <p>App launcher tiles will appear here in a future phase.</p>
                </div>
              </div>
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
