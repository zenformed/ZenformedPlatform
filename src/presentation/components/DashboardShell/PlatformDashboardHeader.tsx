'use client';

import { useMemo, type ReactElement } from 'react';
import { ThemeToggle } from '@/presentation/components/ThemeToggle/ThemeToggle';
import {
  pickHeaderShellClassNames,
  pickAppsLauncherClassNames,
  ZenformedAppsLauncher,
  ZenformedDashboardHeader,
  useZenformedAppLaunch,
  type AccountMenuUserIdentity,
  type ZenformedAccountMenuLabels,
} from '@zenformed/core/dashboard-shell';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import { PLATFORM_APPS } from '@/platform/appDefinitions/platformApps';
import { resolvePlatformAccountMenuUser } from '@/platform/auth/resolvePlatformAccountMenuUser';
import { PlatformCartNavButton } from '@/presentation/components/Cart/PlatformCartNavButton';
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
  appsSectionTitle: content.apps.sectionTitle,
};

export type PlatformDashboardHeaderProps = {
  user: { email: string } | null;
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
  organizationRoleLabel,
  avatarUrl,
  avatarLoading,
  getAccessToken,
  onOpenSettings,
  onRequestSignOutConfirm,
  onRequestProfilePhotoModal,
}: PlatformDashboardHeaderProps): ReactElement {
  const { session, user: saasUser } = useSaaSProfile();
  const accountUser = useMemo<AccountMenuUserIdentity | null>(() => {
    if (user == null) return null;
    return resolvePlatformAccountMenuUser(user.email, saasUser?.user_metadata);
  }, [saasUser?.user_metadata, user]);
  const { launchApp, launchingAppId, launchError } = useZenformedAppLaunch({
    launchApiUrl: '/api/internal/app-launch',
    getAccessToken: () => session?.access_token ?? null,
  });

  return (
    <ZenformedDashboardHeader
      classNames={headerShellClassNames}
      user={accountUser}
      avatarUrl={avatarUrl}
      avatarLoading={avatarLoading}
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
            showAccountSection={false}
            appsIcon={<AppsIcon />}
          />
          <PlatformCartNavButton />
        </>
      }
      onOpenSettings={onOpenSettings}
      onRequestSignOutConfirm={onRequestSignOutConfirm}
      onRequestProfilePhotoModal={onRequestProfilePhotoModal}
      profilePhotoChangeEnabled={false}
      settingsIcon={<SettingsIcon className={headerShellClassNames.accountMenuBtnIcon} />}
      signOutIcon={<SignOutIcon className={headerShellClassNames.accountMenuBtnIcon} />}
      profilePhotoCameraIcon={<CameraIcon />}
    />
  );
}
