'use client';

import { useCallback, useRef, useState, type ChangeEvent, type RefObject } from 'react';
import { useOrganizationLogoUpload } from '@zenformed/core/dashboard-shell';
import { env } from '@/infrastructure/config/env';
import { platformDashboardContent as content } from '@/platform/content/platformDashboardContent';
import {
  platformDashboardNavigation as nav,
  type PlatformSettingsSectionId,
  type PlatformSidebarNavId,
} from '@/platform/navigation/platformDashboardNavigation';
import { usePlatformAuth } from '@/presentation/hooks/usePlatformAuth';
import {
  computePlatformIsAdmin,
  resolvePlatformShopName,
} from '@/presentation/features/platformDashboard/platformDashboardViewModel';

export type PlatformDashboardUser = {
  id: string;
  email: string;
};

export function usePlatformDashboard(): {
  user: PlatformDashboardUser | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
  shopName: string;
  logoUrl: string | null;
  brandingLoading: boolean;
  effectiveLicenseTier: string | undefined;
  isAdmin: boolean;
  avatarUrl: string | null;
  avatarLoading: boolean;
  refetchAvatar: () => Promise<void>;
  getAccessToken: () => string | null;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  settingsSection: PlatformSettingsSectionId;
  setSettingsSection: (section: PlatformSettingsSectionId) => void;
  signOutModalOpen: boolean;
  setSignOutModalOpen: (open: boolean) => void;
  profilePhotoModalOpen: boolean;
  setProfilePhotoModalOpen: (open: boolean) => void;
  sidebarNav: PlatformSidebarNavId;
  setSidebarNav: (id: PlatformSidebarNavId) => void;
  hasAvatarPhoto: boolean;
  refetchBranding: () => Promise<void>;
  logoUploading: boolean;
  headerLogoFileInputRef: RefObject<HTMLInputElement>;
  handleLogoFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
} {
  const { user, session, isLoading: authLoading, signOut } = usePlatformAuth();

  const dashboardUser =
    user?.email != null
      ? {
          id: user.id,
          email: user.email,
        }
      : null;

  const shopName = resolvePlatformShopName(
    user?.user_metadata as Record<string, unknown> | undefined,
    content.branding.defaultShopNameFallback
  );

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const getAccessToken = useCallback(
    (): string | null => sessionRef.current?.access_token?.trim() ?? null,
    []
  );

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<PlatformSettingsSectionId>('about');
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [profilePhotoModalOpen, setProfilePhotoModalOpen] = useState(false);
  const [sidebarNav, setSidebarNav] = useState<PlatformSidebarNavId>('home');

  const refetchBranding = useCallback(async (): Promise<void> => {}, []);
  const refetchAvatar = useCallback(async (): Promise<void> => {}, []);

  const { logoUploading, headerLogoFileInputRef, handleLogoFileChange } = useOrganizationLogoUpload({
    brandingApiUrl: nav.apis.branding,
    getAccessToken,
    refetchBranding,
    logoSaveFailedFallback: content.branding.logoSaveFailedFallback,
  });

  const isAdmin = computePlatformIsAdmin(env.isSaasMode, dashboardUser);

  return {
    user: dashboardUser,
    authLoading,
    signOut,
    shopName,
    logoUrl: null,
    brandingLoading: false,
    effectiveLicenseTier: undefined,
    isAdmin,
    avatarUrl: null,
    avatarLoading: false,
    refetchAvatar,
    getAccessToken,
    settingsOpen,
    setSettingsOpen,
    settingsSection,
    setSettingsSection,
    signOutModalOpen,
    setSignOutModalOpen,
    profilePhotoModalOpen,
    setProfilePhotoModalOpen,
    sidebarNav,
    setSidebarNav,
    hasAvatarPhoto: false,
    refetchBranding,
    logoUploading,
    headerLogoFileInputRef,
    handleLogoFileChange,
  };
}

export type UsePlatformDashboardResult = ReturnType<typeof usePlatformDashboard>;
