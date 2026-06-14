'use client';

import type { ReactElement } from 'react';
import { ThemeToggle } from '@/presentation/components/ThemeToggle/ThemeToggle';
import {
  pickHeaderShellClassNames,
  pickAppsLauncherClassNames,
  ZenformedAppsLauncher,
  ZenformedDashboardHeader,
  useZenformedAppLaunch,
  type ZenformedAccountMenuLabels,
} from '@zenformed/core/dashboard-shell';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import {
  AppsIcon,
  CameraIcon,
  SettingsIcon,
  SignOutIcon,
} from '@/platform/icons/platformDashboardShellIcons';
import { useSaaSProfile } from '@/presentation/hooks/useSaaSProfile';
import styles from '../../../../app/(dashboard)/dashboard/dashboard.module.css';
import appsStyles from '../../../../app/(dashboard)/dashboard/platformDashboard.module.css';

const headerShellClassNames = pickHeaderShellClassNames(styles);
const appsLauncherClassNames = pickAppsLauncherClassNames(appsStyles);

const accountMenuLabels: ZenformedAccountMenuLabels = {
  menuTriggerAriaLabel: nav.header.account.menuTriggerAriaLabel,
  planAriaLabelPrefix: nav.header.account.planAriaLabelPrefix,
  adminBadgeLabel: nav.header.account.adminBadgeLabel,
  roleAriaLabelPrefix: 'Role:',
  profilePhotoChangeTitle: nav.header.account.profilePhotoChange.title,
  profilePhotoChangeAriaLabel: nav.header.account.profilePhotoChange.ariaLabel,
  settingsButtonLabel: nav.header.account.settingsButton.label,
  signOutButtonLabel: nav.header.account.signOutButton.label,
};

const appsLauncherLabels = {
  triggerAriaLabel: nav.header.appsLauncher.triggerAriaLabel,
  popoverAriaLabel: nav.header.appsLauncher.popoverAriaLabel,
  comingSoonLabel: content.apps.comingSoonLabel,
};

export type PlatformDashboardHeaderProps = {
  user: { email: string } | null;
  effectiveLicenseTier: string | null | undefined;
  organizationRoleLabel?: string | null;
  avatarUrl: string | null | undefined;
  avatarLoading: boolean;
  getAccessToken: () => string | null;
  onOpenSettings: () => void;
  onRequestSignOutConfirm: () => void;
  onRequestProfilePhotoModal: () => void;
};

export function PlatformDashboardHeader({
  user,
  effectiveLicenseTier,
  organizationRoleLabel,
  avatarUrl,
  avatarLoading,
  getAccessToken,
  onOpenSettings,
  onRequestSignOutConfirm,
  onRequestProfilePhotoModal,
}: PlatformDashboardHeaderProps): ReactElement {
  const { session } = useSaaSProfile();
  const { launchApp, launchingAppId, launchError } = useZenformedAppLaunch({
    launchApiUrl: '/api/internal/app-launch',
    getAccessToken: () => session?.access_token ?? null,
  });

  return (
    <ZenformedDashboardHeader
      classNames={headerShellClassNames}
      user={user}
      avatarUrl={avatarUrl}
      avatarLoading={avatarLoading}
      effectiveLicenseTier={effectiveLicenseTier}
      organizationRoleLabel={organizationRoleLabel}
      labels={accountMenuLabels}
      settingsApiUrl={nav.apis.usersMeSettings}
      getAccessToken={getAccessToken}
      sessionUserId={session?.user?.id ?? null}
      themeToggle={
        <>
          <ThemeToggle />
          <ZenformedAppsLauncher
            apps={PLATFORM_APPS}
            classNames={appsLauncherClassNames}
            labels={appsLauncherLabels}
            launchApp={launchApp}
            launchingAppId={launchingAppId}
            launchError={launchError}
            appsIcon={<AppsIcon />}
          />
        </>
      }
      onOpenSettings={onOpenSettings}
      onRequestSignOutConfirm={onRequestSignOutConfirm}
      onRequestProfilePhotoModal={onRequestProfilePhotoModal}
      settingsIcon={<SettingsIcon className={headerShellClassNames.accountMenuBtnIcon} />}
      signOutIcon={<SignOutIcon className={headerShellClassNames.accountMenuBtnIcon} />}
      profilePhotoCameraIcon={<CameraIcon />}
    />
  );
}
