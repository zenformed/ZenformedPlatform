'use client';

import type { ReactElement } from 'react';
import { ThemeToggle } from '@/presentation/components/ThemeToggle/ThemeToggle';
import {
  pickHeaderShellClassNames,
  ZenformedDashboardHeader,
  type ZenformedAccountMenuLabels,
} from '@zenformed/core/dashboard-shell';
import { platformDashboardNavigation as nav } from '@/platform/navigation/platformDashboardNavigation';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import {
  CameraIcon,
  SettingsIcon,
  SignOutIcon,
} from '@/platform/icons/platformDashboardShellIcons';
import styles from '../../../../app/(dashboard)/dashboard/dashboard.module.css';

const headerShellClassNames = pickHeaderShellClassNames(styles);

const accountMenuLabels: ZenformedAccountMenuLabels = {
  menuTriggerAriaLabel: nav.header.account.menuTriggerAriaLabel,
  planAriaLabelPrefix: nav.header.account.planAriaLabelPrefix,
  adminBadgeLabel: nav.header.account.adminBadgeLabel,
  profilePhotoChangeTitle: nav.header.account.profilePhotoChange.title,
  profilePhotoChangeAriaLabel: nav.header.account.profilePhotoChange.ariaLabel,
  settingsButtonLabel: nav.header.account.settingsButton.label,
  signOutButtonLabel: nav.header.account.signOutButton.label,
};

export type PlatformDashboardHeaderProps = {
  user: { email: string } | null;
  effectiveLicenseTier: string | null | undefined;
  isAdmin: boolean;
  avatarUrl: string | null | undefined;
  avatarLoading: boolean;
  shopName: string | null | undefined;
  onOpenSettings: () => void;
  onRequestSignOutConfirm: () => void;
  onRequestProfilePhotoModal: () => void;
};

export function PlatformDashboardHeader({
  user,
  effectiveLicenseTier,
  isAdmin,
  avatarUrl,
  avatarLoading,
  shopName,
  onOpenSettings,
  onRequestSignOutConfirm,
  onRequestProfilePhotoModal,
}: PlatformDashboardHeaderProps): ReactElement {
  return (
    <ZenformedDashboardHeader
      classNames={headerShellClassNames}
      user={user}
      avatarUrl={avatarUrl}
      avatarLoading={avatarLoading}
      shopName={shopName}
      defaultShopNameFallback={content.branding.defaultShopNameFallback}
      effectiveLicenseTier={effectiveLicenseTier}
      isAdmin={isAdmin}
      labels={accountMenuLabels}
      themeToggle={<ThemeToggle />}
      onOpenSettings={onOpenSettings}
      onRequestSignOutConfirm={onRequestSignOutConfirm}
      onRequestProfilePhotoModal={onRequestProfilePhotoModal}
      settingsIcon={<SettingsIcon className={headerShellClassNames.accountMenuBtnIcon} />}
      signOutIcon={<SignOutIcon className={headerShellClassNames.accountMenuBtnIcon} />}
      profilePhotoCameraIcon={<CameraIcon />}
    />
  );
}
